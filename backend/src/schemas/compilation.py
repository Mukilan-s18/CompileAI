"""Compilation result models.

The top-level output of the AI Application Compiler pipeline.
Wraps all stage outputs, metadata, and execution results.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

from .intent import IntentModel
from .architecture import SystemArchitecture
from .ui_schema import UISchema
from .api_schema import APISchema
from .db_schema import DatabaseSchema
from .auth_schema import AuthSchema
from .business_logic import BusinessLogicSchema
from .runtime_config import RuntimeConfig
from .validation import ValidationResult
from .security import SecurityAuditResult


class CompilationStatus(str, Enum):
    """Overall compilation status."""
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"


class RepairActionType(str, Enum):
    """Types of repair actions performed."""
    ADD_FIELD = "add_field"
    REMOVE_FIELD = "remove_field"
    FIX_TYPE = "fix_type"
    ADD_ENDPOINT = "add_endpoint"
    ADD_TABLE = "add_table"
    ADD_COLUMN = "add_column"
    FIX_RELATIONSHIP = "fix_relationship"
    ADD_PERMISSION = "add_permission"
    ADD_ROLE = "add_role"
    ADD_ROUTE_GUARD = "add_route_guard"
    FIX_FOREIGN_KEY = "fix_foreign_key"
    ADD_NAVIGATION = "add_navigation"


class RepairAction(BaseModel):
    """A single repair action performed by the repair engine."""
    action_type: RepairActionType = Field(..., description="Type of repair")
    target_schema: str = Field(
        ..., description="Schema affected: ui, api, db, auth, business_logic"
    )
    location: str = Field(..., description="Dot-path location of the repair")
    description: str = Field(..., description="What was repaired")
    error_id: str = Field(..., description="ID of the validation error that triggered this repair")


class ExecutionCheckResult(BaseModel):
    """Result of a single execution simulation check."""
    check_name: str = Field(..., description="Name of the check")
    passed: bool = Field(..., description="Whether the check passed")
    details: str = Field(default="", description="Check details or failure reason")
    artifacts: list[str] = Field(
        default_factory=list,
        description="Generated artifacts (e.g., SQL DDL, route definitions)",
    )


class ExecutionResult(BaseModel):
    """Result of the execution simulation.

    Stage 6 output.
    """
    status: str = Field(..., description="Overall status: PASS or FAIL")
    checks: list[ExecutionCheckResult] = Field(
        ..., description="Individual check results"
    )
    passed_count: int = Field(default=0, description="Number of passed checks")
    failed_count: int = Field(default=0, description="Number of failed checks")
    generated_ddl: str = Field(
        default="", description="Generated SQL DDL for database creation"
    )
    generated_routes: list[str] = Field(
        default_factory=list, description="Generated route definitions"
    )


class StageMetrics(BaseModel):
    """Timing and metrics for a single pipeline stage."""
    stage_name: str = Field(..., description="Pipeline stage name")
    duration_ms: float = Field(..., description="Stage duration in milliseconds")
    retries: int = Field(default=0, description="Number of retries")
    tokens_used: int = Field(default=0, description="LLM tokens consumed")
    success: bool = Field(default=True, description="Whether stage succeeded")


class CompilationMetadata(BaseModel):
    """Metadata about the compilation process."""
    started_at: datetime = Field(
        default_factory=datetime.utcnow, description="Compilation start time"
    )
    completed_at: datetime | None = Field(
        default=None, description="Compilation completion time"
    )
    total_duration_ms: float = Field(default=0, description="Total duration in milliseconds")
    stage_metrics: list[StageMetrics] = Field(
        default_factory=list, description="Per-stage timing metrics"
    )
    total_tokens_used: int = Field(default=0, description="Total LLM tokens consumed")
    model_used: str = Field(default="", description="LLM model used")
    repair_iterations: int = Field(default=0, description="Number of repair iterations")


class CompilationResult(BaseModel):
    """Complete compilation result — the top-level output.

    Contains all stage outputs, validation results, repairs, and execution status.
    This is the primary data structure returned by the /generate endpoint.
    """
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique compilation identifier",
    )
    status: CompilationStatus = Field(..., description="Overall compilation status")
    prompt: str = Field(..., description="Original user prompt")
    intent: IntentModel | None = Field(default=None, description="Stage 1: Extracted intent")
    architecture: SystemArchitecture | None = Field(
        default=None, description="Stage 2: System architecture"
    )
    ui_schema: UISchema | None = Field(default=None, description="Stage 3: UI specification")
    api_schema: APISchema | None = Field(default=None, description="Stage 3: API specification")
    db_schema: DatabaseSchema | None = Field(
        default=None, description="Stage 3: Database specification"
    )
    auth_schema: AuthSchema | None = Field(
        default=None, description="Stage 3: Auth specification"
    )
    business_logic: BusinessLogicSchema | None = Field(
        default=None, description="Stage 3: Business logic rules"
    )
    runtime_config: RuntimeConfig | None = Field(
        default=None, description="Stage 3: Runtime configuration"
    )
    validation: ValidationResult | None = Field(
        default=None, description="Stage 4: Validation results"
    )
    security_audit: SecurityAuditResult | None = Field(
        default=None, description="Stage 4.5: Security audit results"
    )
    repair_log: list[RepairAction] = Field(
        default_factory=list, description="Stage 5: Repair actions performed"
    )
    execution_result: ExecutionResult | None = Field(
        default=None, description="Stage 6: Execution simulation results"
    )
    generated_code: dict[str, str] = Field(
        default_factory=dict, description="Stage 7: Generated source code files"
    )
    iac_templates: dict[str, str] = Field(
        default_factory=dict, description="Stage 8: Generated Infrastructure as Code"
    )
    metadata: CompilationMetadata = Field(
        default_factory=CompilationMetadata,
        description="Compilation process metadata",
    )


class CompilationRequest(BaseModel):
    """Request body for the /generate endpoint."""
    prompt: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Natural language product requirements",
    )


class CompilationSummary(BaseModel):
    """Lightweight summary for listing compilations."""
    id: str
    status: CompilationStatus
    prompt: str
    app_name: str = ""
    domain: str = ""
    created_at: datetime
    duration_ms: float = 0
    validation_errors: int = 0
    repair_count: int = 0
    execution_status: str = ""
