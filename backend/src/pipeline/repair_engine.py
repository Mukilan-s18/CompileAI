"""Stage 5 — Repair Engine.

Performs targeted, dependency-aware repairs on failed schemas.
Does NOT regenerate everything — only patches the specific failures.
"""

from __future__ import annotations

import logging
import time

from src.schemas.compilation import CompilationResult, RepairAction, RepairActionType
from src.schemas.validation import (
    ValidationResult,
    ValidationError,
    ValidationErrorType,
)
from src.schemas.db_schema import Column, ColumnType, ForeignKey, Index, DBTable
from src.schemas.api_schema import APIEndpoint, HTTPMethod, ResponseField, FieldType, QueryParam
from src.schemas.auth_schema import RouteGuard, RBACRule
from src.schemas.ui_schema import NavigationItem

logger = logging.getLogger(__name__)


class RepairEngine:
    """Targeted repair engine for validation failures.

    Strategies:
    - MissingField → Add field to relevant schema
    - SchemaMismatch → Patch the mismatched schema section
    - InvalidRelationship → Rebuild relationship subgraph
    - ForeignKeyMismatch → Fix or add foreign key references
    - MissingEndpoint → Add missing API endpoint
    - RoleNotFound → Add missing role
    - MissingAuthGuard → Add route guard

    Dependency-aware: repairs cascade (fixing DB may trigger API fix).
    """

    def repair(
        self,
        compilation: CompilationResult,
        validation: ValidationResult,
    ) -> tuple[CompilationResult, list[RepairAction]]:
        """Repair validation errors in the compilation result.

        Args:
            compilation: The compilation result with errors.
            validation: The validation result with error details.

        Returns:
            Tuple of (repaired CompilationResult, list of repair actions taken).
        """
        logger.info(f"Stage 5: Repairing {len(validation.errors)} errors")
        start_time = time.time()

        repair_log: list[RepairAction] = []

        for error in validation.errors:
            actions = self._repair_error(compilation, error)
            repair_log.extend(actions)

        # Also attempt to fix warnings that are actionable
        for warning in validation.warnings:
            if warning.error_type in (
                ValidationErrorType.MISSING_COLUMN,
                ValidationErrorType.MISSING_AUTH_GUARD,
            ):
                actions = self._repair_error(compilation, warning)
                repair_log.extend(actions)

        duration_ms = (time.time() - start_time) * 1000
        logger.info(f"Stage 5 complete: {len(repair_log)} repairs applied, {duration_ms:.0f}ms")

        return compilation, repair_log

    def _repair_error(
        self,
        comp: CompilationResult,
        error: ValidationError,
    ) -> list[RepairAction]:
        """Dispatch repair for a single error."""
        repair_map = {
            ValidationErrorType.MISSING_ENDPOINT: self._repair_missing_endpoint,
            ValidationErrorType.MISSING_COLUMN: self._repair_missing_column,
            ValidationErrorType.MISSING_TABLE: self._repair_missing_table,
            ValidationErrorType.FOREIGN_KEY_MISMATCH: self._repair_foreign_key,
            ValidationErrorType.ROLE_NOT_FOUND: self._repair_missing_role,
            ValidationErrorType.MISSING_AUTH_GUARD: self._repair_missing_guard,
            ValidationErrorType.SCHEMA_MISMATCH: self._repair_schema_mismatch,
            ValidationErrorType.DUPLICATE_DEFINITION: self._repair_duplicate,
        }

        handler = repair_map.get(error.error_type)
        if handler:
            try:
                return handler(comp, error)
            except Exception as e:
                logger.warning(f"Repair failed for {error.error_id}: {e}")
                return []

        logger.debug(f"No repair strategy for error type: {error.error_type}")
        return []

    # ── Repair: Missing endpoint ─────────────────────────────

    def _repair_missing_endpoint(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Add a missing API endpoint."""
        if not comp.api_schema:
            return []

        # Parse endpoint info from error
        # Location format: UI.page_name.form_name.submit_endpoint
        parts = error.location.split(".")
        # Extract path and method from error message
        message = error.message
        method = "POST"
        path = ""

        for m in ["POST", "GET", "PUT", "DELETE", "PATCH"]:
            if m in message:
                method = m
                break

        # Extract path from message (between method and "but")
        import re
        path_match = re.search(r"(?:GET|POST|PUT|DELETE|PATCH)\s+(/\S+)", message)
        if path_match:
            path = path_match.group(1)

        if not path:
            return []

        # Infer a reasonable endpoint
        tag = path.strip("/").split("/")[-1].replace("-", " ").title()

        new_endpoint = APIEndpoint(
            path=path,
            method=HTTPMethod(method),
            summary=f"Auto-generated endpoint for {path}",
            tag=tag,
            response_fields=[
                ResponseField(name="id", field_type=FieldType.UUID),
                ResponseField(name="status", field_type=FieldType.STRING),
            ],
        )

        comp.api_schema.endpoints.append(new_endpoint)

        return [RepairAction(
            action_type=RepairActionType.ADD_ENDPOINT,
            target_schema="api",
            location=f"API.{path}",
            description=f"Added {method} {path} endpoint",
            error_id=error.error_id,
        )]

    # ── Repair: Missing column ───────────────────────────────

    def _repair_missing_column(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Add a missing database column."""
        if not comp.db_schema:
            return []

        # Parse location: DB.table_name or DB.table_name.column_name
        parts = error.location.split(".")
        if len(parts) < 2:
            return []

        table_name = parts[1]
        column_name = parts[2] if len(parts) > 2 else None

        # Find the table
        target_table = None
        for table in comp.db_schema.tables:
            if table.name == table_name:
                target_table = table
                break

        if not target_table:
            return []

        # Determine what column to add
        if column_name == "id":
            new_col = Column(
                name="id",
                column_type=ColumnType.UUID,
                primary_key=True,
                nullable=False,
                default_value="gen_random_uuid()",
            )
        elif column_name == "created_at":
            new_col = Column(
                name="created_at",
                column_type=ColumnType.TIMESTAMP,
                nullable=False,
                default_value="NOW()",
            )
        elif column_name == "updated_at":
            new_col = Column(
                name="updated_at",
                column_type=ColumnType.TIMESTAMP,
                nullable=False,
                default_value="NOW()",
            )
        elif column_name:
            new_col = Column(
                name=column_name,
                column_type=ColumnType.VARCHAR,
                nullable=True,
                max_length=255,
            )
        else:
            return []

        # Only add if not already present
        existing_names = {c.name for c in target_table.columns}
        if new_col.name not in existing_names:
            target_table.columns.append(new_col)
            return [RepairAction(
                action_type=RepairActionType.ADD_COLUMN,
                target_schema="db",
                location=f"DB.{table_name}.{new_col.name}",
                description=f"Added column '{new_col.name}' to table '{table_name}'",
                error_id=error.error_id,
            )]

        return []

    # ── Repair: Missing table ────────────────────────────────

    def _repair_missing_table(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Add a missing database table."""
        if not comp.db_schema:
            return []

        # Extract table name from error
        parts = error.location.split(".")
        if len(parts) < 2:
            return []

        table_name = parts[1]

        # Check if table already exists
        if any(t.name == table_name for t in comp.db_schema.tables):
            return []

        new_table = DBTable(
            name=table_name,
            description=f"Auto-generated table for {table_name}",
            columns=[
                Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False, default_value="gen_random_uuid()"),
                Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                Column(name="updated_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
            ],
        )

        comp.db_schema.tables.append(new_table)

        return [RepairAction(
            action_type=RepairActionType.ADD_TABLE,
            target_schema="db",
            location=f"DB.{table_name}",
            description=f"Added table '{table_name}' with default columns",
            error_id=error.error_id,
        )]

    # ── Repair: Foreign key mismatch ─────────────────────────

    def _repair_foreign_key(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Fix foreign key references."""
        if not comp.db_schema:
            return []

        repairs = []
        parts = error.location.split(".")
        if len(parts) < 3:
            return []

        table_name = parts[1]
        column_name = parts[2]

        # Find the table and FK
        for table in comp.db_schema.tables:
            if table.name == table_name:
                for fk in table.foreign_keys:
                    if fk.column == column_name:
                        # Check if referenced table exists
                        ref_table_exists = any(
                            t.name == fk.references_table for t in comp.db_schema.tables
                        )
                        if not ref_table_exists:
                            # Create the missing referenced table
                            new_table = DBTable(
                                name=fk.references_table,
                                description=f"Auto-generated table for FK reference",
                                columns=[
                                    Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False, default_value="gen_random_uuid()"),
                                    Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                                    Column(name="updated_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                                ],
                            )
                            comp.db_schema.tables.append(new_table)
                            repairs.append(RepairAction(
                                action_type=RepairActionType.ADD_TABLE,
                                target_schema="db",
                                location=f"DB.{fk.references_table}",
                                description=f"Added table '{fk.references_table}' for FK reference from '{table_name}.{column_name}'",
                                error_id=error.error_id,
                            ))
                        break
                break

        return repairs

    # ── Repair: Missing role ─────────────────────────────────

    def _repair_missing_role(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Add a missing role to auth schema."""
        if not comp.auth_schema:
            return []

        # Extract role name from error message
        import re
        role_match = re.search(r"Role '(\w+)'", error.message)
        if not role_match:
            return []

        role_name = role_match.group(1)

        # Check if role already exists
        existing_roles = {rule.role for rule in comp.auth_schema.rbac_rules}
        if role_name in existing_roles:
            return []

        # Add basic RBAC rule for the new role
        comp.auth_schema.rbac_rules.append(
            RBACRule(
                role=role_name,
                resource="*",
                actions=["read", "list"],
            )
        )

        return [RepairAction(
            action_type=RepairActionType.ADD_ROLE,
            target_schema="auth",
            location=f"Auth.rbac_rules.{role_name}",
            description=f"Added RBAC rules for role '{role_name}'",
            error_id=error.error_id,
        )]

    # ── Repair: Missing route guard ──────────────────────────

    def _repair_missing_guard(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Add a missing route guard."""
        if not comp.auth_schema:
            return []

        # Extract route from location
        parts = error.location.split(".")
        route = parts[-1] if parts else ""
        if not route.startswith("/"):
            route = "/" + route

        # Determine allowed roles from the page
        allowed_roles: list[str] = []
        if comp.ui_schema:
            for page in comp.ui_schema.pages:
                if page.route == route:
                    allowed_roles = page.allowed_roles or []
                    break

        if not allowed_roles:
            # Default: all roles from intent
            if comp.intent:
                allowed_roles = list(comp.intent.roles)

        comp.auth_schema.route_guards.append(
            RouteGuard(
                route=route,
                allowed_roles=allowed_roles,
                requires_auth=True,
            )
        )

        return [RepairAction(
            action_type=RepairActionType.ADD_ROUTE_GUARD,
            target_schema="auth",
            location=f"Auth.route_guards.{route}",
            description=f"Added route guard for '{route}'",
            error_id=error.error_id,
        )]

    # ── Repair: Schema mismatch ──────────────────────────────

    def _repair_schema_mismatch(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Fix schema mismatches by adding missing fields to DB."""
        if not comp.db_schema:
            return []

        # Parse location: API.path.field_name
        parts = error.location.split(".")
        if len(parts) < 3:
            return []

        field_name = parts[-1]

        # Find related table from error
        for related in error.related_locations:
            if related.startswith("DB."):
                table_name = related.split(".")[1]
                return self._add_column_to_table(comp, table_name, field_name, error.error_id)

        return []

    # ── Repair: Duplicate definition ─────────────────────────

    def _repair_duplicate(
        self, comp: CompilationResult, error: ValidationError
    ) -> list[RepairAction]:
        """Remove duplicate definitions."""
        parts = error.location.split(".")
        if len(parts) < 2:
            return []

        if parts[0] == "API" and comp.api_schema:
            # Remove duplicate endpoints
            seen: set[tuple[str, str]] = set()
            unique_endpoints = []
            for ep in comp.api_schema.endpoints:
                key = (ep.path, ep.method.value)
                if key not in seen:
                    seen.add(key)
                    unique_endpoints.append(ep)
            comp.api_schema.endpoints = unique_endpoints
            return [RepairAction(
                action_type=RepairActionType.REMOVE_FIELD,
                target_schema="api",
                location=error.location,
                description="Removed duplicate endpoint",
                error_id=error.error_id,
            )]

        if parts[0] == "DB" and comp.db_schema:
            table_name = parts[1]
            for table in comp.db_schema.tables:
                if table.name == table_name:
                    seen_cols: set[str] = set()
                    unique_cols = []
                    for col in table.columns:
                        if col.name not in seen_cols:
                            seen_cols.add(col.name)
                            unique_cols.append(col)
                    table.columns = unique_cols
                    return [RepairAction(
                        action_type=RepairActionType.REMOVE_FIELD,
                        target_schema="db",
                        location=error.location,
                        description=f"Removed duplicate column in table '{table_name}'",
                        error_id=error.error_id,
                    )]

        return []

    # ── Helpers ──────────────────────────────────────────────

    def _add_column_to_table(
        self,
        comp: CompilationResult,
        table_name: str,
        column_name: str,
        error_id: str,
    ) -> list[RepairAction]:
        """Helper to add a column to an existing table."""
        for table in comp.db_schema.tables:
            if table.name == table_name:
                existing = {c.name for c in table.columns}
                if column_name not in existing:
                    table.columns.append(Column(
                        name=column_name,
                        column_type=ColumnType.VARCHAR,
                        nullable=True,
                        max_length=255,
                    ))
                    return [RepairAction(
                        action_type=RepairActionType.ADD_COLUMN,
                        target_schema="db",
                        location=f"DB.{table_name}.{column_name}",
                        description=f"Added column '{column_name}' to table '{table_name}' to resolve schema mismatch",
                        error_id=error_id,
                    )]
        return []


# Singleton
repair_engine = RepairEngine()
