"""Validation result models.

Stage 4 output: Structured validation errors and warnings from the
cross-schema consistency checker.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class ValidationErrorType(str, Enum):
    """Types of validation errors."""
    MISSING_FIELD = "MissingField"
    TYPE_MISMATCH = "TypeMismatch"
    SCHEMA_MISMATCH = "SchemaMismatch"
    INVALID_REFERENCE = "InvalidReference"
    FOREIGN_KEY_MISMATCH = "ForeignKeyMismatch"
    ORPHANED_ENTITY = "OrphanedEntity"
    CIRCULAR_DEPENDENCY = "CircularDependency"
    MISSING_ENDPOINT = "MissingEndpoint"
    MISSING_TABLE = "MissingTable"
    MISSING_COLUMN = "MissingColumn"
    ROLE_NOT_FOUND = "RoleNotFound"
    PERMISSION_NOT_FOUND = "PermissionNotFound"
    ROUTE_CONFLICT = "RouteConflict"
    MISSING_AUTH_GUARD = "MissingAuthGuard"
    INCONSISTENT_FEATURE = "InconsistentFeature"
    DUPLICATE_DEFINITION = "DuplicateDefinition"


class ValidationSeverity(str, Enum):
    """Severity levels for validation issues."""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationError(BaseModel):
    """A single validation error or warning."""
    error_id: str = Field(..., description="Unique error identifier")
    error_type: ValidationErrorType = Field(..., description="Error classification")
    severity: ValidationSeverity = Field(..., description="Severity level")
    location: str = Field(
        ...,
        description="Dot-path location, e.g. 'API.contacts.email' or 'DB.users.role_id'",
    )
    message: str = Field(..., description="Human-readable error description")
    suggestion: str = Field(..., description="Actionable suggestion for fixing the error")
    related_locations: list[str] = Field(
        default_factory=list,
        description="Other schema locations related to this error",
    )


class ValidationResult(BaseModel):
    """Result of the validation engine.

    Stage 4 output.
    """
    is_valid: bool = Field(..., description="Whether all schemas are valid and consistent")
    error_count: int = Field(default=0, description="Number of errors")
    warning_count: int = Field(default=0, description="Number of warnings")
    errors: list[ValidationError] = Field(
        default_factory=list, description="Validation errors"
    )
    warnings: list[ValidationError] = Field(
        default_factory=list, description="Validation warnings"
    )
    checks_performed: list[str] = Field(
        default_factory=list, description="Names of all validation checks that ran"
    )
