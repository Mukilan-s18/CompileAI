import time
from typing import Dict, List
from pydantic import BaseModel

# Simplified cost model (GPT-4o standard pricing approx)
COST_PER_1K_PROMPT = 0.005
COST_PER_1K_COMPLETION = 0.015

class StageMetrics(BaseModel):
    stage_name: str
    duration_ms: float
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cost_usd: float = 0.0

class CompilationTelemetry(BaseModel):
    session_id: str
    total_duration_ms: float = 0.0
    total_cost_usd: float = 0.0
    stages: List[StageMetrics] = []

class TelemetryLogger:
    def __init__(self, session_id: str):
        self.telemetry = CompilationTelemetry(session_id=session_id)
        self._stage_starts: Dict[str, float] = {}

    def start_stage(self, stage_name: str):
        self._stage_starts[stage_name] = time.time()

    def end_stage(self, stage_name: str, prompt_tokens: int = 0, completion_tokens: int = 0):
        start_time = self._stage_starts.get(stage_name)
        if not start_time:
            return
            
        duration_ms = (time.time() - start_time) * 1000
        cost = ((prompt_tokens / 1000.0) * COST_PER_1K_PROMPT) + ((completion_tokens / 1000.0) * COST_PER_1K_COMPLETION)
        
        stage_metric = StageMetrics(
            stage_name=stage_name,
            duration_ms=duration_ms,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            cost_usd=cost
        )
        
        self.telemetry.stages.append(stage_metric)
        self.telemetry.total_duration_ms += duration_ms
        self.telemetry.total_cost_usd += cost

    def get_report(self) -> dict:
        return self.telemetry.model_dump()
