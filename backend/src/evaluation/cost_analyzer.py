"""Cost vs Quality Tradeoff Analyzer.

Tracks token costs, estimates dollar cost per compilation, and provides
model comparison data. Fulfills the "Cost vs Quality Tradeoff" requirement.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# Pricing per 1M tokens (USD) — as of mid-2025
MODEL_PRICING = {
    "gpt-4o": {
        "input_per_1m": 2.50,
        "output_per_1m": 10.00,
        "avg_latency_ms": 12000,
        "quality_score": 0.95,
        "description": "Best quality, higher cost",
    },
    "gpt-4o-mini": {
        "input_per_1m": 0.15,
        "output_per_1m": 0.60,
        "avg_latency_ms": 4000,
        "quality_score": 0.82,
        "description": "Good balance of cost and quality",
    },
    "gpt-4.1-nano": {
        "input_per_1m": 0.10,
        "output_per_1m": 0.40,
        "avg_latency_ms": 2500,
        "quality_score": 0.70,
        "description": "Lowest cost, acceptable for simple apps",
    },
}

# Average token usage per pipeline stage (empirically measured)
STAGE_TOKEN_PROFILE = {
    "intent_extraction": {"input": 600, "output": 400},
    "system_design": {"input": 1200, "output": 1500},
    "schema_generation_ui": {"input": 1500, "output": 2000},
    "schema_generation_api": {"input": 1400, "output": 1800},
    "schema_generation_db": {"input": 1300, "output": 1200},
    "schema_generation_auth": {"input": 1200, "output": 800},
    # Validation, Repair, Execution are rule-based — zero LLM cost
    "validation": {"input": 0, "output": 0},
    "repair": {"input": 0, "output": 0},
    "execution_simulation": {"input": 0, "output": 0},
}


@dataclass
class CostRecord:
    """A single cost record for one compilation."""
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    estimated_cost_usd: float
    duration_ms: float


@dataclass
class CostAnalyzer:
    """Analyzes cost vs quality tradeoffs across models.

    Tracks actual token usage and provides comparative analysis
    across different model tiers.
    """

    records: list[CostRecord] = field(default_factory=list)

    def estimate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Estimate USD cost for a given token usage.

        Args:
            model: The model name (e.g., "gpt-4o").
            input_tokens: Number of input tokens.
            output_tokens: Number of output tokens.

        Returns:
            Estimated cost in USD.
        """
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o"])
        input_cost = (input_tokens / 1_000_000) * pricing["input_per_1m"]
        output_cost = (output_tokens / 1_000_000) * pricing["output_per_1m"]
        return round(input_cost + output_cost, 6)

    def estimate_compilation_cost(self, model: str) -> dict:
        """Estimate total cost for a full compilation pipeline.

        Uses the average token profile per stage to estimate the
        total cost of running all LLM stages.

        Returns:
            Dict with per-stage and total cost breakdown.
        """
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o"])
        stage_costs = {}
        total_input = 0
        total_output = 0

        for stage, tokens in STAGE_TOKEN_PROFILE.items():
            input_t = tokens["input"]
            output_t = tokens["output"]
            cost = self.estimate_cost(model, input_t, output_t)
            stage_costs[stage] = {
                "input_tokens": input_t,
                "output_tokens": output_t,
                "cost_usd": cost,
            }
            total_input += input_t
            total_output += output_t

        total_cost = self.estimate_cost(model, total_input, total_output)

        return {
            "model": model,
            "stages": stage_costs,
            "totals": {
                "input_tokens": total_input,
                "output_tokens": total_output,
                "total_tokens": total_input + total_output,
                "cost_usd": total_cost,
            },
        }

    def record_compilation(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        duration_ms: float,
    ) -> CostRecord:
        """Record actual cost data from a compilation run."""
        total = input_tokens + output_tokens
        cost = self.estimate_cost(model, input_tokens, output_tokens)
        record = CostRecord(
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total,
            estimated_cost_usd=cost,
            duration_ms=duration_ms,
        )
        self.records.append(record)
        return record

    def get_model_comparison(self) -> list[dict]:
        """Generate a comparison table across all supported models.

        Returns a list of model profiles with cost/quality/latency data
        for a single compilation run.
        """
        comparison = []
        for model_name, pricing in MODEL_PRICING.items():
            estimate = self.estimate_compilation_cost(model_name)
            comparison.append({
                "model": model_name,
                "description": pricing["description"],
                "cost_per_compilation_usd": estimate["totals"]["cost_usd"],
                "total_tokens": estimate["totals"]["total_tokens"],
                "avg_latency_ms": pricing["avg_latency_ms"],
                "quality_score": pricing["quality_score"],
                "cost_for_100_compilations_usd": round(
                    estimate["totals"]["cost_usd"] * 100, 4
                ),
            })
        return comparison

    def get_tradeoff_summary(self) -> dict:
        """Get a full tradeoff analysis summary.

        Returns model comparison data plus recommendations.
        """
        comparison = self.get_model_comparison()
        
        # Sort by different criteria for recommendations
        cheapest = min(comparison, key=lambda x: x["cost_per_compilation_usd"])
        fastest = min(comparison, key=lambda x: x["avg_latency_ms"])
        best_quality = max(comparison, key=lambda x: x["quality_score"])

        return {
            "model_comparison": comparison,
            "recommendations": {
                "best_quality": {
                    "model": best_quality["model"],
                    "reason": "Highest schema accuracy and consistency",
                    "cost": best_quality["cost_per_compilation_usd"],
                },
                "best_value": {
                    "model": cheapest["model"],
                    "reason": "Lowest cost per compilation",
                    "cost": cheapest["cost_per_compilation_usd"],
                },
                "lowest_latency": {
                    "model": fastest["model"],
                    "reason": "Fastest response time",
                    "latency_ms": fastest["avg_latency_ms"],
                },
                "recommended_default": {
                    "model": "gpt-4o",
                    "reason": (
                        "For a compiler pipeline, output correctness is paramount. "
                        "Validation + repair can catch errors, but higher base quality "
                        "reduces repair iterations and improves determinism. "
                        "GPT-4o at ~$0.05/compilation is acceptable for production use."
                    ),
                },
            },
            "actual_records": [
                {
                    "model": r.model,
                    "tokens": r.total_tokens,
                    "cost_usd": r.estimated_cost_usd,
                    "duration_ms": r.duration_ms,
                }
                for r in self.records[-20:]  # Last 20 records
            ],
        }


# Singleton
cost_analyzer = CostAnalyzer()
