"""API Routes — FastAPI endpoint definitions.

Exposes the compiler pipeline and metrics as a REST API.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional

from src.schemas.compilation import CompilationRequest, CompilationResult, CompilationSummary
from src.schemas.validation import ValidationResult
from src.services.compiler_service import compiler_service
from src.pipeline.conflict_detector import conflict_detector
from src.evaluation.cost_analyzer import cost_analyzer

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request/Response models ──────────────────────────────

class CompilationIdRequest(BaseModel):
    """Request body for operations on existing compilations."""
    compilation_id: str = Field(..., description="ID of the compilation to operate on")


class BenchmarkRunResponse(BaseModel):
    """Response from a benchmark run."""
    total_prompts: int
    completed: int
    success_count: int
    failure_count: int
    avg_duration_ms: float
    results: list[CompilationSummary]


class MetricsSummary(BaseModel):
    """Aggregate metrics summary."""
    total_compilations: int = 0
    success_rate: float = 0
    avg_duration_ms: float = 0
    total_validation_errors: int = 0
    total_repairs: int = 0
    execution_pass_rate: float = 0
    avg_tokens_used: float = 0


class ClarificationResponse(BaseModel):
    """Response from the prompt clarification endpoint."""
    needs_clarification: bool
    confidence_score: float
    prompt_quality: str
    conflicts: list[dict] = []
    auto_assumptions: list[str] = []


class CostAnalysisResponse(BaseModel):
    """Response from the cost tradeoff analysis endpoint."""
    model_comparison: list[dict]
    recommendations: dict
    actual_records: list[dict] = []


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str = "1.0.0"


# ── Endpoints ────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """System health check."""
    return HealthResponse()


@router.post("/generate", response_model=CompilationResult, tags=["Compiler"])
async def generate(request: CompilationRequest):
    """Run the full compilation pipeline on a natural language prompt.

    This is the primary endpoint — it executes all 6 stages:
    1. Intent Extraction
    2. System Design
    3. Schema Generation
    4. Validation
    5. Repair (if needed)
    6. Execution Simulation
    """
    try:
        result = compiler_service.compile(request.prompt)
        return result
    except Exception as e:
        logger.error(f"Compilation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/phase1", response_model=CompilationResult, tags=["Compiler"])
async def generate_phase1(request: CompilationRequest):
    """Run Phase 1 of the compilation pipeline (Intent to Schemas)."""
    try:
        result = compiler_service.compile_phase1(request.prompt)
        return result
    except Exception as e:
        logger.error(f"Phase 1 failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/phase2", response_model=CompilationResult, tags=["Compiler"])
async def generate_phase2(compilation: CompilationResult):
    """Run Phase 2 of the compilation pipeline (Validation to Code Gen) with user-edited schemas."""
    try:
        result = compiler_service.compile_phase2(compilation)
        return result
    except Exception as e:
        logger.error(f"Phase 2 failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/stream", tags=["Compiler"])
async def generate_stream(request: CompilationRequest):
    """Run the compilation pipeline and stream progress using Server-Sent Events (SSE)."""
    import json
    import asyncio
    
    async def event_generator():
        try:
            yield f"data: {json.dumps({'status': 'Starting Phase 1...', 'step': 1})}\n\n"
            await asyncio.sleep(0.1)
            
            # Run phase 1 in a background thread
            phase1_res = await asyncio.to_thread(compiler_service.compile_phase1, request.prompt)
            yield f"data: {json.dumps({'status': 'Phase 1 Complete (Schemas Generated)', 'step': 2})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'status': 'Starting Phase 2 (Validation & Repair)...', 'step': 3})}\n\n"
            # Run phase 2 in a background thread
            phase2_res = await asyncio.to_thread(compiler_service.compile_phase2, phase1_res)
            
            yield f"data: {json.dumps({'status': 'Compilation Complete', 'step': 4, 'result': phase2_res.model_dump(mode='json')})}\n\n"
        except Exception as e:
            logger.error(f"Stream generation failed: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/validate", response_model=CompilationResult, tags=["Compiler"])
async def validate(request: CompilationIdRequest):
    """Re-validate an existing compilation result."""
    try:
        result = compiler_service.validate_compilation(request.compilation_id)
        comp = compiler_service.get_compilation(request.compilation_id)
        return comp
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repair", response_model=CompilationResult, tags=["Compiler"])
async def repair(request: CompilationIdRequest):
    """Run targeted repair on an existing compilation."""
    try:
        result = compiler_service.repair_compilation(request.compilation_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Repair failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate", response_model=CompilationResult, tags=["Compiler"])
async def simulate(request: CompilationIdRequest):
    """Run execution simulation on an existing compilation."""
    try:
        result = compiler_service.simulate_compilation(request.compilation_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Simulation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics", response_model=MetricsSummary, tags=["Analytics"])
async def get_metrics():
    """Get aggregate Prometheus-compatible metrics."""
    return compiler_service.get_metrics_summary()


@router.get("/compilations", response_model=list[CompilationSummary], tags=["Compiler"])
async def list_compilations():
    """List all compilations with summaries."""
    return compiler_service.list_compilations()


@router.get("/compilations/{compilation_id}", response_model=CompilationResult, tags=["Compiler"])
async def get_compilation(compilation_id: str):
    """Get a specific compilation result by ID."""
    result = compiler_service.get_compilation(compilation_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Compilation {compilation_id} not found")
    return result


@router.post("/benchmarks/run", response_model=BenchmarkRunResponse, tags=["Evaluation"])
async def run_benchmarks():
    """Run the full benchmark suite (10 real + 10 edge case prompts)."""
    from src.evaluation.benchmark_runner import benchmark_runner

    try:
        results = benchmark_runner.run_all()
        return results
    except Exception as e:
        logger.error(f"Benchmark run failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/benchmarks", response_model=Optional[BenchmarkRunResponse], tags=["Evaluation"])
async def get_benchmarks():
    """Get the latest benchmark results."""
    from src.evaluation.benchmark_runner import benchmark_runner

    results = benchmark_runner.get_latest_results()
    if not results:
        return None
    return results


@router.post("/clarify", response_model=ClarificationResponse, tags=["Compiler"])
async def clarify_prompt(request: CompilationRequest):
    """Analyze a prompt for conflicts, ambiguity, and underspecification.

    Call this BEFORE /generate to detect issues. If needs_clarification=true,
    the user should refine their prompt before proceeding.
    If needs_clarification=false, the system will proceed with auto_assumptions.
    """
    result = conflict_detector.analyze(request.prompt)
    return result.to_dict()


@router.get("/cost-analysis", response_model=CostAnalysisResponse, tags=["Analytics"])
async def get_cost_analysis():
    """Get cost vs quality tradeoff analysis across models.

    Compares token usage, dollar cost, latency, and quality scores
    for GPT-4o, GPT-4o-mini, and GPT-4.1-nano.
    """
    summary = cost_analyzer.get_tradeoff_summary()
    return summary


class DeterminismTestRequest(BaseModel):
    """Request to run a determinism consistency test."""
    prompt: str = Field(..., min_length=10, max_length=5000)
    runs: int = Field(default=3, ge=2, le=5, description="Number of runs (2-5)")


@router.post("/determinism/test", tags=["Evaluation"])
async def run_determinism_test(request: DeterminismTestRequest):
    """Run a determinism consistency test.

    Runs the same prompt N times and measures Jaccard similarity
    across generated entities, fields, tables, and endpoints.
    """
    from src.evaluation.determinism_tester import determinism_tester

    try:
        result = determinism_tester.test_consistency(request.prompt, request.runs)
        return {
            "prompt": result.prompt,
            "runs": result.runs,
            "entity_jaccard": result.entity_jaccard,
            "field_jaccard": result.field_jaccard,
            "table_jaccard": result.table_jaccard,
            "endpoint_jaccard": result.endpoint_jaccard,
            "overall_score": result.overall_score,
            "duration_ms": round(result.duration_ms, 0),
        }
    except Exception as e:
        logger.error(f"Determinism test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/determinism", tags=["Evaluation"])
async def get_determinism_results():
    """Get results from all determinism consistency tests."""
    from src.evaluation.determinism_tester import determinism_tester
    return determinism_tester.get_summary()
