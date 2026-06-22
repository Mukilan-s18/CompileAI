"""Determinism Consistency Tester.

Runs the same prompt multiple times and measures output consistency
using Jaccard similarity across entity names, field names, and table names.
Proves that temperature=0 + structured output = deterministic behavior.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field

from src.services.compiler_service import compiler_service
from src.schemas.compilation import CompilationResult

logger = logging.getLogger(__name__)


@dataclass
class ConsistencyScore:
    """Consistency score for a single prompt across N runs."""
    prompt: str
    runs: int
    entity_jaccard: float  # Jaccard similarity of entity names
    field_jaccard: float   # Jaccard similarity of field names
    table_jaccard: float   # Jaccard similarity of table names
    endpoint_jaccard: float  # Jaccard similarity of endpoint paths
    overall_score: float   # Weighted average
    duration_ms: float


@dataclass
class DeterminismTester:
    """Tests output consistency across multiple runs.

    Runs the same prompt N times and compares the generated schemas
    to measure deterministic behavior.
    """

    latest_results: list[ConsistencyScore] = field(default_factory=list)

    @staticmethod
    def _jaccard(sets: list[set]) -> float:
        """Calculate average pairwise Jaccard similarity."""
        if len(sets) < 2:
            return 1.0

        total = 0.0
        count = 0
        for i in range(len(sets)):
            for j in range(i + 1, len(sets)):
                intersection = len(sets[i] & sets[j])
                union = len(sets[i] | sets[j])
                if union > 0:
                    total += intersection / union
                else:
                    total += 1.0
                count += 1

        return round(total / count, 4) if count > 0 else 1.0

    @staticmethod
    def _extract_entities(comp: CompilationResult) -> set[str]:
        """Extract entity names from a compilation result."""
        if not comp.architecture:
            return set()
        return {e.name for e in comp.architecture.entities}

    @staticmethod
    def _extract_fields(comp: CompilationResult) -> set[str]:
        """Extract all field names from architecture entities."""
        if not comp.architecture:
            return set()
        fields = set()
        for entity in comp.architecture.entities:
            for f in entity.fields:
                fields.add(f"{entity.name}.{f.name}")
        return fields

    @staticmethod
    def _extract_tables(comp: CompilationResult) -> set[str]:
        """Extract table names from database schema."""
        if not comp.db_schema:
            return set()
        return {t.name for t in comp.db_schema.tables}

    @staticmethod
    def _extract_endpoints(comp: CompilationResult) -> set[str]:
        """Extract endpoint paths from API schema."""
        if not comp.api_schema:
            return set()
        return {f"{ep.method.value} {ep.path}" for ep in comp.api_schema.endpoints}

    def test_consistency(self, prompt: str, runs: int = 3) -> ConsistencyScore:
        """Run a prompt N times and measure output consistency.

        Args:
            prompt: The prompt to test.
            runs: Number of times to run (default 3).

        Returns:
            ConsistencyScore with Jaccard similarities.
        """
        logger.info(f"Determinism test: running prompt {runs} times")
        start_time = time.time()

        compilations: list[CompilationResult] = []
        for i in range(runs):
            logger.info(f"  Run {i+1}/{runs}")
            try:
                comp = compiler_service.compile(prompt)
                compilations.append(comp)
            except Exception as e:
                logger.error(f"  Run {i+1} failed: {e}")

        if len(compilations) < 2:
            return ConsistencyScore(
                prompt=prompt[:100],
                runs=len(compilations),
                entity_jaccard=0.0,
                field_jaccard=0.0,
                table_jaccard=0.0,
                endpoint_jaccard=0.0,
                overall_score=0.0,
                duration_ms=(time.time() - start_time) * 1000,
            )

        # Compute Jaccard similarities
        entity_sets = [self._extract_entities(c) for c in compilations]
        field_sets = [self._extract_fields(c) for c in compilations]
        table_sets = [self._extract_tables(c) for c in compilations]
        endpoint_sets = [self._extract_endpoints(c) for c in compilations]

        ej = self._jaccard(entity_sets)
        fj = self._jaccard(field_sets)
        tj = self._jaccard(table_sets)
        epj = self._jaccard(endpoint_sets)

        # Weighted average (entities + tables are most important)
        overall = round(0.3 * ej + 0.2 * fj + 0.3 * tj + 0.2 * epj, 4)

        score = ConsistencyScore(
            prompt=prompt[:100],
            runs=len(compilations),
            entity_jaccard=ej,
            field_jaccard=fj,
            table_jaccard=tj,
            endpoint_jaccard=epj,
            overall_score=overall,
            duration_ms=(time.time() - start_time) * 1000,
        )

        self.latest_results.append(score)
        logger.info(
            f"Determinism test complete: overall={overall:.4f} "
            f"(entities={ej:.4f}, fields={fj:.4f}, tables={tj:.4f}, endpoints={epj:.4f})"
        )

        return score

    def get_summary(self) -> dict:
        """Get a summary of all consistency tests."""
        if not self.latest_results:
            return {"tests_run": 0, "message": "No determinism tests run yet"}

        avg_overall = sum(r.overall_score for r in self.latest_results) / len(self.latest_results)
        return {
            "tests_run": len(self.latest_results),
            "avg_overall_consistency": round(avg_overall, 4),
            "results": [
                {
                    "prompt": r.prompt,
                    "runs": r.runs,
                    "entity_jaccard": r.entity_jaccard,
                    "field_jaccard": r.field_jaccard,
                    "table_jaccard": r.table_jaccard,
                    "endpoint_jaccard": r.endpoint_jaccard,
                    "overall_score": r.overall_score,
                    "duration_ms": round(r.duration_ms, 0),
                }
                for r in self.latest_results
            ],
        }


# Singleton
determinism_tester = DeterminismTester()
