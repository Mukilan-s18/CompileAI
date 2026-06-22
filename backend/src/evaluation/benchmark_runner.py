"""Benchmark Runner — Executes evaluation prompts through the compiler pipeline.

Runs 10 real product prompts and 10 edge cases, tracking success rate,
repair count, validation failures, latency, and execution pass rate.
"""

from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path

from src.services.compiler_service import compiler_service
from src.schemas.compilation import CompilationSummary, CompilationStatus

logger = logging.getLogger(__name__)

DATASETS_DIR = Path(__file__).parent / "datasets"


class BenchmarkRunner:
    """Runs benchmark prompts through the compilation pipeline.

    Loads prompts from JSON dataset files and runs each through
    the full pipeline, collecting aggregate metrics.
    """

    def __init__(self) -> None:
        self._latest_results: dict | None = None

    def run_all(self) -> dict:
        """Run all benchmark prompts (real + edge cases).

        Returns:
            BenchmarkRunResponse-compatible dict.
        """
        logger.info("Starting benchmark run...")
        start_time = time.time()

        prompts = self._load_prompts()
        results: list[CompilationSummary] = []
        success_count = 0
        failure_count = 0

        for i, prompt_data in enumerate(prompts):
            prompt_id = prompt_data.get("id", f"prompt_{i}")
            prompt_text = prompt_data["prompt"]
            logger.info(f"Benchmark [{i+1}/{len(prompts)}]: {prompt_id}")

            try:
                compilation = compiler_service.compile(prompt_text)

                summary = CompilationSummary(
                    id=compilation.id,
                    status=compilation.status,
                    prompt=prompt_text[:100],
                    app_name=compilation.intent.app_name if compilation.intent else "",
                    domain=compilation.intent.domain if compilation.intent else "",
                    created_at=compilation.metadata.started_at,
                    duration_ms=compilation.metadata.total_duration_ms,
                    validation_errors=(
                        compilation.validation.error_count if compilation.validation else 0
                    ),
                    repair_count=len(compilation.repair_log),
                    execution_status=(
                        compilation.execution_result.status
                        if compilation.execution_result
                        else ""
                    ),
                )
                results.append(summary)

                if compilation.status == CompilationStatus.SUCCESS:
                    success_count += 1
                else:
                    failure_count += 1

            except Exception as e:
                logger.error(f"Benchmark {prompt_id} crashed: {e}")
                failure_count += 1

        total_duration = (time.time() - start_time) * 1000
        avg_duration = total_duration / len(prompts) if prompts else 0

        response = {
            "total_prompts": len(prompts),
            "completed": len(results),
            "success_count": success_count,
            "failure_count": failure_count,
            "avg_duration_ms": round(avg_duration, 0),
            "results": results,
        }

        self._latest_results = response

        logger.info(
            f"Benchmark complete: {success_count}/{len(prompts)} succeeded, "
            f"avg {avg_duration:.0f}ms per prompt"
        )

        return response

    def get_latest_results(self) -> dict | None:
        """Get the latest benchmark run results."""
        return self._latest_results

    def _load_prompts(self) -> list[dict]:
        """Load all benchmark prompts from dataset files."""
        prompts = []

        # Load real prompts
        real_path = DATASETS_DIR / "real_prompts.json"
        if real_path.exists():
            with open(real_path) as f:
                prompts.extend(json.load(f))

        # Load edge cases
        edge_path = DATASETS_DIR / "edge_cases.json"
        if edge_path.exists():
            with open(edge_path) as f:
                prompts.extend(json.load(f))

        logger.info(f"Loaded {len(prompts)} benchmark prompts")
        return prompts


# Singleton
benchmark_runner = BenchmarkRunner()
