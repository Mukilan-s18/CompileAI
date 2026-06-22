"""API endpoint integration tests.

Tests all API routes using FastAPI's TestClient.
"""

import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"


class TestGenerateEndpoint:
    def test_generate_success(self, client):
        response = client.post("/api/generate", json={
            "prompt": "Build a CRM with login, contacts, and dashboard"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "status" in data
        assert data["status"] in ["success", "partial", "failed"]
        assert data["intent"] is not None
        assert data["architecture"] is not None

    def test_generate_short_prompt(self, client):
        response = client.post("/api/generate", json={
            "prompt": "Build a CRM"
        })
        assert response.status_code == 200
        data = response.json()
        # Should still work with assumptions
        assert data["intent"] is not None

    def test_generate_missing_prompt(self, client):
        response = client.post("/api/generate", json={})
        assert response.status_code == 422  # Validation error

    def test_generate_prompt_too_short(self, client):
        response = client.post("/api/generate", json={"prompt": "hi"})
        assert response.status_code == 422  # min_length=10


class TestCompilationsEndpoint:
    def test_list_compilations(self, client):
        response = client.get("/api/compilations")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_nonexistent_compilation(self, client):
        response = client.get("/api/compilations/nonexistent-id")
        assert response.status_code == 404


class TestMetricsEndpoint:
    def test_get_metrics(self, client):
        response = client.get("/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "total_compilations" in data
        assert "success_rate" in data


class TestValidateEndpoint:
    def test_validate_nonexistent(self, client):
        response = client.post("/api/validate", json={
            "compilation_id": "nonexistent"
        })
        assert response.status_code == 404


class TestRepairEndpoint:
    def test_repair_nonexistent(self, client):
        response = client.post("/api/repair", json={
            "compilation_id": "nonexistent"
        })
        assert response.status_code == 404


class TestSimulateEndpoint:
    def test_simulate_nonexistent(self, client):
        response = client.post("/api/simulate", json={
            "compilation_id": "nonexistent"
        })
        assert response.status_code == 404


class TestEndToEnd:
    """End-to-end tests: generate → validate → repair → simulate."""

    def test_full_pipeline_flow(self, client):
        # 1. Generate
        gen_response = client.post("/api/generate", json={
            "prompt": "Build a CRM with contacts, login, and analytics dashboard"
        })
        assert gen_response.status_code == 200
        compilation_id = gen_response.json()["id"]

        # 2. Get compilation
        get_response = client.get(f"/api/compilations/{compilation_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == compilation_id

        # 3. Re-validate
        val_response = client.post("/api/validate", json={
            "compilation_id": compilation_id
        })
        assert val_response.status_code == 200

        # 4. Repair
        repair_response = client.post("/api/repair", json={
            "compilation_id": compilation_id
        })
        assert repair_response.status_code == 200

        # 5. Simulate
        sim_response = client.post("/api/simulate", json={
            "compilation_id": compilation_id
        })
        assert sim_response.status_code == 200
        assert sim_response.json()["execution_result"]["status"] in ["PASS", "FAIL"]

        # 6. Check metrics updated
        metrics = client.get("/api/metrics").json()
        assert metrics["total_compilations"] >= 1

        # 7. Check compilations list
        comps = client.get("/api/compilations").json()
        assert any(c["id"] == compilation_id for c in comps)
