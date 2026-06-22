"""Compiler Service — Orchestrates the full 6-stage compilation pipeline.

This is the core service that chains all pipeline stages together:
Intent → Architecture → Schemas → Validation → Repair → Simulation
"""

from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime

from src.schemas.compilation import (
    CompilationResult,
    CompilationStatus,
    CompilationMetadata,
    StageMetrics,
    CompilationSummary,
)
from src.schemas.validation import ValidationResult
from src.pipeline.intent_extractor import intent_extractor
from src.pipeline.system_designer import system_designer
from src.pipeline.schema_generator import schema_generator
from src.pipeline.validator import validator
from src.pipeline.security_auditor import security_auditor
from src.pipeline.repair_engine import repair_engine
from src.pipeline.code_generator import code_generator
from src.pipeline.iac_generator import iac_generator
from src.pipeline.execution_simulator import execution_simulator
from src.pipeline.conflict_detector import conflict_detector
from src.evaluation.cost_analyzer import cost_analyzer
from src.config import settings

logger = logging.getLogger(__name__)


class CompilerService:
    """Orchestrates the full AI Application Compiler pipeline.

    Maintains an in-memory store of compilation results for the dashboard.
    """

    def __init__(self) -> None:
        self._compilations: dict[str, CompilationResult] = {}

    def compile(self, prompt: str) -> CompilationResult:
        """Run the full 6-stage compilation pipeline.

        Args:
            prompt: Natural language product requirements.

        Returns:
            CompilationResult with all stage outputs.
        """
        compilation_id = str(uuid.uuid4())
        start_time = time.time()
        stage_metrics: list[StageMetrics] = []
        total_tokens = 0

        logger.info(f"Starting compilation {compilation_id[:8]}...")

        compilation = CompilationResult(
            id=compilation_id,
            status=CompilationStatus.FAILED,
            prompt=prompt,
            metadata=CompilationMetadata(started_at=datetime.utcnow()),
        )

        try:
            # ── Stage 0: Conflict Detection (pre-pipeline) ────
            clarification = conflict_detector.analyze(prompt)
            if clarification.auto_assumptions:
                logger.info(
                    f"Conflict detector made {len(clarification.auto_assumptions)} assumptions"
                )

            # ── Stage 1: Intent Extraction ─────────────────
            intent, intent_metrics = intent_extractor.extract(prompt)
            compilation.intent = intent
            stage_metrics.append(StageMetrics(**intent_metrics))
            total_tokens += intent_metrics.get("tokens_used", 0)

            # Merge auto-assumptions from conflict detection
            for assumption in clarification.auto_assumptions:
                if assumption not in intent.assumptions:
                    intent.assumptions.append(assumption)

            # ── Stage 2: System Design ─────────────────────
            architecture, arch_metrics = system_designer.design(intent)
            compilation.architecture = architecture
            stage_metrics.append(StageMetrics(**arch_metrics))
            total_tokens += arch_metrics.get("tokens_used", 0)

            # ── Stage 3: Schema Generation ─────────────────
            schemas, schema_metrics_list = schema_generator.generate(intent, architecture)
            compilation.ui_schema = schemas.ui_schema
            compilation.api_schema = schemas.api_schema
            compilation.db_schema = schemas.db_schema
            compilation.auth_schema = schemas.auth_schema
            compilation.business_logic = schemas.business_logic
            compilation.runtime_config = schemas.runtime_config
            for sm in schema_metrics_list:
                stage_metrics.append(StageMetrics(**sm))
                total_tokens += sm.get("tokens_used", 0)

            # ── Stage 4: Validation ────────────────────────
            validation_start = time.time()
            validation = validator.validate(compilation)
            compilation.validation = validation
            stage_metrics.append(StageMetrics(
                stage_name="validation",
                duration_ms=(time.time() - validation_start) * 1000,
                success=True,
            ))

            # ── Stage 4.5: Security Audit ──────────────────
            security_start = time.time()
            security_audit = security_auditor.audit(compilation)
            compilation.security_audit = security_audit
            stage_metrics.append(StageMetrics(
                stage_name="security_audit",
                duration_ms=(time.time() - security_start) * 1000,
                success=security_audit.passed,
            ))

            # Fail early if critical security flaws exist
            if not security_audit.passed:
                compilation.status = CompilationStatus.FAILED
                compilation.metadata.completed_at = datetime.utcnow()
                compilation.metadata.stage_metrics = stage_metrics
                return compilation

            # ── Stage 5: Repair (if needed) ────────────────
            repair_iterations = 0
            while not validation.is_valid and repair_iterations < settings.max_repair_iterations:
                repair_start = time.time()
                compilation, repair_actions = repair_engine.repair(compilation, validation)
                compilation.repair_log.extend(repair_actions)
                repair_iterations += 1

                # Re-validate after repair
                validation = validator.validate(compilation)
                compilation.validation = validation

                stage_metrics.append(StageMetrics(
                    stage_name=f"repair_iteration_{repair_iterations}",
                    duration_ms=(time.time() - repair_start) * 1000,
                    success=True,
                ))

            # ── Stage 6: Execution Simulation ──────────────
            sim_start = time.time()
            execution_result = execution_simulator.simulate(compilation)
            compilation.execution_result = execution_result
            stage_metrics.append(StageMetrics(
                stage_name="execution_simulation",
                duration_ms=(time.time() - sim_start) * 1000,
                success=execution_result.status == "PASS",
            ))

            # ── Stage 7: Code Generation ───────────────────
            code_start = time.time()
            generated_code = code_generator.generate(compilation)
            compilation.generated_code = generated_code
            stage_metrics.append(StageMetrics(
                stage_name="code_generation",
                duration_ms=(time.time() - code_start) * 1000,
                success=True,
            ))

            # ── Stage 8: IaC Generation ────────────────────
            iac_start = time.time()
            iac_templates = iac_generator.generate(compilation)
            compilation.iac_templates = iac_templates
            stage_metrics.append(StageMetrics(
                stage_name="iac_generation",
                duration_ms=(time.time() - iac_start) * 1000,
                success=True,
            ))

            # Determine final status
            if validation.is_valid and execution_result.status == "PASS" and security_audit.passed:
                compilation.status = CompilationStatus.SUCCESS
            elif validation.is_valid or execution_result.status == "PASS":
                compilation.status = CompilationStatus.PARTIAL
            else:
                compilation.status = CompilationStatus.FAILED

        except Exception as e:
            logger.error(f"Compilation {compilation_id[:8]} failed: {e}")
            compilation.status = CompilationStatus.FAILED

        # Finalize metadata
        total_duration = (time.time() - start_time) * 1000
        compilation.metadata = CompilationMetadata(
            started_at=compilation.metadata.started_at,
            completed_at=datetime.utcnow(),
            total_duration_ms=total_duration,
            stage_metrics=stage_metrics,
            total_tokens_used=total_tokens,
            model_used=settings.openai_model,
            repair_iterations=len([
                s for s in stage_metrics if s.stage_name.startswith("repair")
            ]),
        )

        # Store result
        self._compilations[compilation_id] = compilation

        logger.info(
            f"Compilation {compilation_id[:8]} complete: {compilation.status.value}, "
            f"{total_duration:.0f}ms, {total_tokens} tokens"
        )

        # Track cost
        cost_analyzer.record_compilation(
            model=settings.openai_model,
            input_tokens=total_tokens // 2,  # Estimate split
            output_tokens=total_tokens // 2,
            duration_ms=total_duration,
        )

        return compilation

    def validate_compilation(self, compilation_id: str) -> ValidationResult:
        """Re-validate an existing compilation."""
        comp = self._compilations.get(compilation_id)
        if not comp:
            raise ValueError(f"Compilation {compilation_id} not found")
        result = validator.validate(comp)
        comp.validation = result
        return result

    def repair_compilation(self, compilation_id: str) -> CompilationResult:
        """Run repair on an existing compilation."""
        comp = self._compilations.get(compilation_id)
        if not comp:
            raise ValueError(f"Compilation {compilation_id} not found")
        if not comp.validation:
            comp.validation = validator.validate(comp)
        comp, repairs = repair_engine.repair(comp, comp.validation)
        comp.repair_log.extend(repairs)
        comp.validation = validator.validate(comp)
        return comp

    def simulate_compilation(self, compilation_id: str) -> CompilationResult:
        """Run execution simulation on an existing compilation."""
        comp = self._compilations.get(compilation_id)
        if not comp:
            raise ValueError(f"Compilation {compilation_id} not found")
        comp.execution_result = execution_simulator.simulate(comp)
        return comp

    def get_compilation(self, compilation_id: str) -> CompilationResult | None:
        """Get a specific compilation result."""
        return self._compilations.get(compilation_id)

    def list_compilations(self) -> list[CompilationSummary]:
        """List all compilations as summaries."""
        summaries = []
        for comp in self._compilations.values():
            summaries.append(CompilationSummary(
                id=comp.id,
                status=comp.status,
                prompt=comp.prompt[:100] + ("..." if len(comp.prompt) > 100 else ""),
                app_name=comp.intent.app_name if comp.intent else "",
                domain=comp.intent.domain if comp.intent else "",
                created_at=comp.metadata.started_at,
                duration_ms=comp.metadata.total_duration_ms,
                validation_errors=comp.validation.error_count if comp.validation else 0,
                repair_count=len(comp.repair_log),
                execution_status=comp.execution_result.status if comp.execution_result else "",
            ))
        return sorted(summaries, key=lambda s: s.created_at, reverse=True)

    def get_metrics_summary(self) -> dict:
        """Get aggregate metrics for the dashboard."""
        if not self._compilations:
            return {
                "total_compilations": 0,
                "success_rate": 0,
                "avg_duration_ms": 0,
                "total_validation_errors": 0,
                "total_repairs": 0,
                "execution_pass_rate": 0,
                "avg_tokens_used": 0,
            }

        comps = list(self._compilations.values())
        successes = sum(1 for c in comps if c.status == CompilationStatus.SUCCESS)
        exec_passes = sum(
            1 for c in comps
            if c.execution_result and c.execution_result.status == "PASS"
        )

        return {
            "total_compilations": len(comps),
            "success_rate": round(successes / len(comps) * 100, 1),
            "avg_duration_ms": round(
                sum(c.metadata.total_duration_ms for c in comps) / len(comps), 0
            ),
            "total_validation_errors": sum(
                c.validation.error_count for c in comps if c.validation
            ),
            "total_repairs": sum(len(c.repair_log) for c in comps),
            "execution_pass_rate": round(exec_passes / len(comps) * 100, 1),
            "avg_tokens_used": round(
                sum(c.metadata.total_tokens_used for c in comps) / len(comps), 0
            ),
        }

    def compile_phase1(self, prompt: str) -> CompilationResult:
        """Run Phase 1: Intent Extraction to Schema Generation (For HITL)."""
        compilation_id = str(uuid.uuid4())
        start_time = time.time()
        stage_metrics: list[StageMetrics] = []
        total_tokens = 0

        logger.info(f"Starting Phase 1 compilation {compilation_id[:8]}...")
        compilation = CompilationResult(
            id=compilation_id,
            status=CompilationStatus.PARTIAL,
            prompt=prompt,
            metadata=CompilationMetadata(started_at=datetime.utcnow()),
        )

        try:
            clarification = conflict_detector.analyze(prompt)
            intent, intent_metrics = intent_extractor.extract(prompt)
            compilation.intent = intent
            stage_metrics.append(StageMetrics(**intent_metrics))
            total_tokens += intent_metrics.get("tokens_used", 0)

            for assumption in clarification.auto_assumptions:
                if assumption not in intent.assumptions:
                    intent.assumptions.append(assumption)

            architecture, arch_metrics = system_designer.design(intent)
            compilation.architecture = architecture
            stage_metrics.append(StageMetrics(**arch_metrics))
            total_tokens += arch_metrics.get("tokens_used", 0)

            schemas, schema_metrics_list = schema_generator.generate(intent, architecture)
            compilation.ui_schema = schemas.ui_schema
            compilation.api_schema = schemas.api_schema
            compilation.db_schema = schemas.db_schema
            compilation.auth_schema = schemas.auth_schema
            compilation.business_logic = schemas.business_logic
            compilation.runtime_config = schemas.runtime_config
            for sm in schema_metrics_list:
                stage_metrics.append(StageMetrics(**sm))
                total_tokens += sm.get("tokens_used", 0)
        except Exception as e:
            logger.error(f"Phase 1 failed: {e}")
            compilation.status = CompilationStatus.FAILED

        compilation.metadata.stage_metrics.extend(stage_metrics)
        compilation.metadata.total_tokens_used += total_tokens
        self._compilations[compilation_id] = compilation
        return compilation

    def compile_phase2(self, compilation: CompilationResult) -> CompilationResult:
        """Run Phase 2: Validation, Security, Repair, Simulation, CodeGen, IaC (For HITL)."""
        logger.info(f"Starting Phase 2 for {compilation.id[:8]}...")
        stage_metrics: list[StageMetrics] = []

        try:
            validation_start = time.time()
            validation = validator.validate(compilation)
            compilation.validation = validation
            stage_metrics.append(StageMetrics(
                stage_name="validation",
                duration_ms=(time.time() - validation_start) * 1000,
                success=True,
            ))

            security_start = time.time()
            security_audit = security_auditor.audit(compilation)
            compilation.security_audit = security_audit
            stage_metrics.append(StageMetrics(
                stage_name="security_audit",
                duration_ms=(time.time() - security_start) * 1000,
                success=security_audit.passed,
            ))

            if not security_audit.passed:
                compilation.status = CompilationStatus.FAILED
                compilation.metadata.stage_metrics.extend(stage_metrics)
                self._compilations[compilation.id] = compilation
                return compilation

            repair_iterations = 0
            while not validation.is_valid and repair_iterations < settings.max_repair_iterations:
                repair_start = time.time()
                compilation, repair_actions = repair_engine.repair(compilation, validation)
                compilation.repair_log.extend(repair_actions)
                repair_iterations += 1
                validation = validator.validate(compilation)
                compilation.validation = validation
                stage_metrics.append(StageMetrics(
                    stage_name=f"repair_iteration_{repair_iterations}",
                    duration_ms=(time.time() - repair_start) * 1000,
                    success=True,
                ))

            sim_start = time.time()
            execution_result = execution_simulator.simulate(compilation)
            compilation.execution_result = execution_result
            stage_metrics.append(StageMetrics(
                stage_name="execution_simulation",
                duration_ms=(time.time() - sim_start) * 1000,
                success=execution_result.status == "PASS",
            ))

            code_start = time.time()
            compilation.generated_code = code_generator.generate(compilation)
            stage_metrics.append(StageMetrics(
                stage_name="code_generation",
                duration_ms=(time.time() - code_start) * 1000,
                success=True,
            ))

            iac_start = time.time()
            compilation.iac_templates = iac_generator.generate(compilation)
            stage_metrics.append(StageMetrics(
                stage_name="iac_generation",
                duration_ms=(time.time() - iac_start) * 1000,
                success=True,
            ))

            if validation.is_valid and execution_result.status == "PASS":
                compilation.status = CompilationStatus.SUCCESS
            else:
                compilation.status = CompilationStatus.PARTIAL

        except Exception as e:
            logger.error(f"Phase 2 failed: {e}")
            compilation.status = CompilationStatus.FAILED

        compilation.metadata.stage_metrics.extend(stage_metrics)
        self._compilations[compilation.id] = compilation
        return compilation

# Singleton
compiler_service = CompilerService()
