"""Prometheus-compatible metrics for the compiler pipeline.

Tracks compilation counts, durations, validation errors, repairs, and execution results.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class MetricsCollector:
    """In-memory metrics collector with Prometheus-compatible output.

    Tracks:
    - compilation_total: Total compilations by status
    - compilation_duration_seconds: Histogram of compilation durations
    - validation_errors_total: Validation errors by type
    - repair_operations_total: Total repair operations
    - execution_pass_rate: Execution simulation pass rate
    - stage_duration_seconds: Per-stage timing
    """

    compilation_counts: dict[str, int] = field(default_factory=lambda: {
        "success": 0,
        "partial": 0,
        "failed": 0,
    })
    compilation_durations: list[float] = field(default_factory=list)
    validation_error_counts: dict[str, int] = field(default_factory=dict)
    repair_count: int = 0
    execution_results: dict[str, int] = field(default_factory=lambda: {
        "PASS": 0,
        "FAIL": 0,
    })
    stage_durations: dict[str, list[float]] = field(default_factory=dict)
    token_usage: list[int] = field(default_factory=list)

    def record_compilation(
        self,
        status: str,
        duration_ms: float,
        tokens_used: int = 0,
    ) -> None:
        """Record a completed compilation."""
        self.compilation_counts[status] = self.compilation_counts.get(status, 0) + 1
        self.compilation_durations.append(duration_ms)
        if tokens_used:
            self.token_usage.append(tokens_used)

    def record_validation_error(self, error_type: str) -> None:
        """Record a validation error by type."""
        self.validation_error_counts[error_type] = (
            self.validation_error_counts.get(error_type, 0) + 1
        )

    def record_repair(self) -> None:
        """Record a repair operation."""
        self.repair_count += 1

    def record_execution_result(self, status: str) -> None:
        """Record an execution simulation result."""
        self.execution_results[status] = self.execution_results.get(status, 0) + 1

    def record_stage_duration(self, stage_name: str, duration_ms: float) -> None:
        """Record the duration of a pipeline stage."""
        if stage_name not in self.stage_durations:
            self.stage_durations[stage_name] = []
        self.stage_durations[stage_name].append(duration_ms)

    def get_summary(self) -> dict:
        """Get a summary of all metrics."""
        total = sum(self.compilation_counts.values())
        return {
            "compilations": {
                "total": total,
                "by_status": dict(self.compilation_counts),
                "success_rate": (
                    round(self.compilation_counts.get("success", 0) / total * 100, 1)
                    if total > 0
                    else 0
                ),
            },
            "duration": {
                "avg_ms": (
                    round(sum(self.compilation_durations) / len(self.compilation_durations), 0)
                    if self.compilation_durations
                    else 0
                ),
                "min_ms": round(min(self.compilation_durations), 0) if self.compilation_durations else 0,
                "max_ms": round(max(self.compilation_durations), 0) if self.compilation_durations else 0,
            },
            "validation_errors": dict(self.validation_error_counts),
            "repairs": self.repair_count,
            "execution": {
                "by_status": dict(self.execution_results),
                "pass_rate": (
                    round(
                        self.execution_results.get("PASS", 0)
                        / max(sum(self.execution_results.values()), 1)
                        * 100,
                        1,
                    )
                ),
            },
            "tokens": {
                "total": sum(self.token_usage),
                "avg_per_compilation": (
                    round(sum(self.token_usage) / len(self.token_usage), 0)
                    if self.token_usage
                    else 0
                ),
            },
            "stage_durations": {
                stage: {
                    "avg_ms": round(sum(durations) / len(durations), 0),
                    "count": len(durations),
                }
                for stage, durations in self.stage_durations.items()
            },
        }

    def to_prometheus(self) -> str:
        """Export metrics in Prometheus exposition format."""
        lines = []

        # Compilation total
        lines.append("# HELP ai_compiler_compilations_total Total compilations by status")
        lines.append("# TYPE ai_compiler_compilations_total counter")
        for status, count in self.compilation_counts.items():
            lines.append(f'ai_compiler_compilations_total{{status="{status}"}} {count}')

        # Duration
        lines.append("# HELP ai_compiler_duration_ms Compilation duration in milliseconds")
        lines.append("# TYPE ai_compiler_duration_ms gauge")
        if self.compilation_durations:
            avg = sum(self.compilation_durations) / len(self.compilation_durations)
            lines.append(f"ai_compiler_duration_ms {avg:.0f}")

        # Validation errors
        lines.append("# HELP ai_compiler_validation_errors_total Validation errors by type")
        lines.append("# TYPE ai_compiler_validation_errors_total counter")
        for err_type, count in self.validation_error_counts.items():
            lines.append(f'ai_compiler_validation_errors_total{{type="{err_type}"}} {count}')

        # Repairs
        lines.append("# HELP ai_compiler_repairs_total Total repair operations")
        lines.append("# TYPE ai_compiler_repairs_total counter")
        lines.append(f"ai_compiler_repairs_total {self.repair_count}")

        # Execution pass rate
        lines.append("# HELP ai_compiler_execution_pass_rate Execution simulation pass rate")
        lines.append("# TYPE ai_compiler_execution_pass_rate gauge")
        total_exec = sum(self.execution_results.values())
        pass_rate = (
            self.execution_results.get("PASS", 0) / max(total_exec, 1) * 100
        )
        lines.append(f"ai_compiler_execution_pass_rate {pass_rate:.1f}")

        return "\n".join(lines) + "\n"


# Singleton
metrics_collector = MetricsCollector()
