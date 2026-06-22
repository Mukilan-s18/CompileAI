"""Tests for new gap closure modules: conflict detection, cost analysis, and hallucination detection."""

import pytest
from src.pipeline.conflict_detector import conflict_detector, ConflictType
from src.evaluation.cost_analyzer import cost_analyzer, CostAnalyzer


# ── Conflict Detection Tests ─────────────────────────────


class TestConflictDetector:
    """Tests for prompt conflict detection."""

    def test_clear_prompt_no_conflicts(self):
        """A well-specified prompt should have no high-severity conflicts."""
        result = conflict_detector.analyze(
            "Build a CRM with login, contacts, dashboard, role-based access, "
            "and premium plan with payments. Admins can see analytics."
        )
        assert not result.needs_clarification
        assert result.confidence_score >= 0.7
        assert result.prompt_quality in ("excellent", "good")

    def test_detects_contradictory_auth(self):
        """Should detect contradiction: 'no login' + 'personalized dashboards'."""
        result = conflict_detector.analyze(
            "Build an app with no login required but users should have personalized dashboards and my dashboard."
        )
        has_contradiction = any(
            c.conflict_type == ConflictType.CONTRADICTORY for c in result.conflicts
        )
        assert has_contradiction
        assert result.needs_clarification

    def test_detects_underspecified_prompt(self):
        """A single-word prompt should be flagged as underspecified."""
        result = conflict_detector.analyze("CRM")
        has_underspec = any(
            c.conflict_type == ConflictType.UNDERSPECIFIED for c in result.conflicts
        )
        assert has_underspec
        assert result.confidence_score < 0.8

    def test_detects_vague_prompt(self):
        """A prompt full of vague terms but no features should be flagged."""
        result = conflict_detector.analyze(
            "Build a good, professional, modern, sleek application for my business."
        )
        has_ambiguous = any(
            c.conflict_type == ConflictType.AMBIGUOUS for c in result.conflicts
        )
        assert has_ambiguous

    def test_detects_feature_overload(self):
        """A 'super app' prompt should be flagged as overloaded."""
        result = conflict_detector.analyze(
            "Build a super app with CRM, HRMS, inventory, ecommerce, social media, "
            "messaging, video calls, project management, analytics, and more."
        )
        has_overload = any(
            c.conflict_type == ConflictType.OVERLOADED for c in result.conflicts
        )
        assert has_overload

    def test_auto_assumptions_generated(self):
        """Short prompts should generate auto-assumptions."""
        result = conflict_detector.analyze("Build a dashboard")
        assert len(result.auto_assumptions) > 0

    def test_role_conflict_detection(self):
        """Should detect 'all users are admins' + 'restricted access' conflict."""
        result = conflict_detector.analyze(
            "Build a system where all users are admins but also have restricted access."
        )
        has_role_conflict = any(
            c.conflict_type == ConflictType.ROLE_CONFLICT for c in result.conflicts
        )
        assert has_role_conflict

    def test_to_dict_serializable(self):
        """ClarificationResult.to_dict() should return a JSON-serializable dict."""
        result = conflict_detector.analyze("Build a CRM with login and contacts.")
        d = result.to_dict()
        assert isinstance(d, dict)
        assert "needs_clarification" in d
        assert "confidence_score" in d
        assert "conflicts" in d


# ── Cost Analysis Tests ──────────────────────────────────


class TestCostAnalyzer:
    """Tests for the cost vs quality tradeoff analyzer."""

    def test_estimate_cost_gpt4o(self):
        """GPT-4o cost estimation should be non-zero for non-zero tokens."""
        analyzer = CostAnalyzer()
        cost = analyzer.estimate_cost("gpt-4o", 1000, 500)
        assert cost > 0

    def test_estimate_cost_mini_cheaper(self):
        """GPT-4o-mini should be cheaper than GPT-4o for the same tokens."""
        analyzer = CostAnalyzer()
        cost_4o = analyzer.estimate_cost("gpt-4o", 5000, 3000)
        cost_mini = analyzer.estimate_cost("gpt-4o-mini", 5000, 3000)
        assert cost_mini < cost_4o

    def test_estimate_compilation_cost(self):
        """Full compilation cost estimate should include all stages."""
        analyzer = CostAnalyzer()
        result = analyzer.estimate_compilation_cost("gpt-4o")
        assert "stages" in result
        assert "totals" in result
        assert result["totals"]["total_tokens"] > 0
        assert result["totals"]["cost_usd"] > 0

    def test_model_comparison(self):
        """Model comparison should return data for all 3 models."""
        analyzer = CostAnalyzer()
        comparison = analyzer.get_model_comparison()
        assert len(comparison) == 3
        models = {c["model"] for c in comparison}
        assert "gpt-4o" in models
        assert "gpt-4o-mini" in models

    def test_record_compilation(self):
        """Recording a compilation should add to records."""
        analyzer = CostAnalyzer()
        record = analyzer.record_compilation("gpt-4o", 1000, 500, 5000.0)
        assert record.total_tokens == 1500
        assert record.estimated_cost_usd > 0
        assert len(analyzer.records) == 1

    def test_tradeoff_summary(self):
        """Tradeoff summary should include recommendations."""
        analyzer = CostAnalyzer()
        summary = analyzer.get_tradeoff_summary()
        assert "model_comparison" in summary
        assert "recommendations" in summary
        assert "best_quality" in summary["recommendations"]
        assert "best_value" in summary["recommendations"]
        assert "recommended_default" in summary["recommendations"]

    def test_zero_cost_for_rule_stages(self):
        """Validation, repair, and execution stages should have zero token cost."""
        analyzer = CostAnalyzer()
        result = analyzer.estimate_compilation_cost("gpt-4o")
        assert result["stages"]["validation"]["cost_usd"] == 0
        assert result["stages"]["repair"]["cost_usd"] == 0
        assert result["stages"]["execution_simulation"]["cost_usd"] == 0


# ── API Endpoint Tests ───────────────────────────────────


class TestNewEndpoints:
    """Tests for the new /clarify and /cost-analysis endpoints."""

    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from src.main import app
        return TestClient(app)

    def test_clarify_endpoint(self, client):
        """POST /api/clarify should return clarification analysis."""
        response = client.post("/api/clarify", json={"prompt": "Build a CRM with login and contacts"})
        assert response.status_code == 200
        data = response.json()
        assert "needs_clarification" in data
        assert "confidence_score" in data
        assert "prompt_quality" in data

    def test_clarify_short_prompt(self, client):
        """POST /api/clarify with a very short prompt should flag issues."""
        response = client.post("/api/clarify", json={"prompt": "Build something useful for my company"})
        assert response.status_code == 200
        data = response.json()
        assert data["confidence_score"] < 1.0

    def test_cost_analysis_endpoint(self, client):
        """GET /api/cost-analysis should return model comparison data."""
        response = client.get("/api/cost-analysis")
        assert response.status_code == 200
        data = response.json()
        assert "model_comparison" in data
        assert len(data["model_comparison"]) == 3
        assert "recommendations" in data
