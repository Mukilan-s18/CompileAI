"""Stage 4 — Validation Engine.

Rule-based cross-schema consistency checker. No LLM calls needed.
Validates that all generated schemas are internally consistent and
cross-reference correctly.
"""

from __future__ import annotations

import logging
import time
import uuid

from src.schemas.compilation import CompilationResult
from src.schemas.validation import (
    ValidationResult,
    ValidationError,
    ValidationErrorType,
    ValidationSeverity,
)

logger = logging.getLogger(__name__)


class Validator:
    """Cross-schema validation engine.

    Performs rule-based checks across all generated schemas:
    1. JSON structural validity (guaranteed by Pydantic)
    2. Required field presence
    3. Type consistency
    4. Cross-schema reference integrity
    5. Logical consistency
    """

    def validate(self, compilation: CompilationResult) -> ValidationResult:
        """Validate all schemas for consistency.

        Args:
            compilation: The compilation result with all generated schemas.

        Returns:
            ValidationResult with errors and warnings.
        """
        logger.info("Stage 4: Validating cross-schema consistency")
        start_time = time.time()

        errors: list[ValidationError] = []
        warnings: list[ValidationError] = []
        checks_performed: list[str] = []

        # Run all validation checks
        if compilation.ui_schema and compilation.api_schema:
            self._check_ui_api_consistency(compilation, errors, warnings)
            checks_performed.append("ui_api_consistency")

        if compilation.api_schema and compilation.db_schema:
            self._check_api_db_consistency(compilation, errors, warnings)
            checks_performed.append("api_db_consistency")

        if compilation.auth_schema:
            self._check_role_consistency(compilation, errors, warnings)
            checks_performed.append("role_consistency")

        if compilation.db_schema:
            self._check_foreign_keys(compilation, errors, warnings)
            checks_performed.append("foreign_key_validity")

        if compilation.ui_schema and compilation.auth_schema:
            self._check_route_guards(compilation, errors, warnings)
            checks_performed.append("route_guard_consistency")

        if compilation.intent:
            self._check_feature_completeness(compilation, errors, warnings)
            checks_performed.append("feature_completeness")

        if compilation.db_schema:
            self._check_table_structure(compilation, errors, warnings)
            checks_performed.append("table_structure")

        if compilation.api_schema:
            self._check_endpoint_structure(compilation, errors, warnings)
            checks_performed.append("endpoint_structure")

        if compilation.architecture and compilation.db_schema:
            self._check_hallucinated_fields(compilation, errors, warnings)
            checks_performed.append("hallucinated_field_detection")

        duration_ms = (time.time() - start_time) * 1000
        is_valid = len(errors) == 0

        logger.info(
            f"Stage 4 complete: {'VALID' if is_valid else 'INVALID'}, "
            f"{len(errors)} errors, {len(warnings)} warnings, {duration_ms:.0f}ms"
        )

        return ValidationResult(
            is_valid=is_valid,
            error_count=len(errors),
            warning_count=len(warnings),
            errors=errors,
            warnings=warnings,
            checks_performed=checks_performed,
        )

    def _make_error(
        self,
        error_type: ValidationErrorType,
        severity: ValidationSeverity,
        location: str,
        message: str,
        suggestion: str,
        related: list[str] | None = None,
    ) -> ValidationError:
        """Create a validation error with a unique ID."""
        return ValidationError(
            error_id=f"VAL-{uuid.uuid4().hex[:8].upper()}",
            error_type=error_type,
            severity=severity,
            location=location,
            message=message,
            suggestion=suggestion,
            related_locations=related or [],
        )

    # ── Check: UI ↔ API consistency ─────────────────────────

    def _check_ui_api_consistency(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify that UI form submit endpoints exist in API schema."""
        api_paths = set()
        for ep in comp.api_schema.endpoints:
            api_paths.add((ep.path, ep.method.value))

        for page in comp.ui_schema.pages:
            for component in page.components:
                if component.form:
                    form = component.form
                    endpoint_key = (form.submit_endpoint, form.submit_method)
                    if endpoint_key not in api_paths:
                        errors.append(self._make_error(
                            error_type=ValidationErrorType.MISSING_ENDPOINT,
                            severity=ValidationSeverity.ERROR,
                            location=f"UI.{page.name}.{form.name}.submit_endpoint",
                            message=f"Form '{form.name}' submits to {form.submit_method} {form.submit_endpoint} but this endpoint does not exist in API schema",
                            suggestion=f"Add endpoint {form.submit_method} {form.submit_endpoint} to the API schema",
                            related=[f"API.endpoints"],
                        ))

                if component.table:
                    table = component.table
                    # Check if data endpoint exists (GET)
                    has_data_ep = any(
                        ep.path == table.data_endpoint and ep.method.value == "GET"
                        for ep in comp.api_schema.endpoints
                    )
                    if not has_data_ep:
                        errors.append(self._make_error(
                            error_type=ValidationErrorType.MISSING_ENDPOINT,
                            severity=ValidationSeverity.ERROR,
                            location=f"UI.{page.name}.{table.name}.data_endpoint",
                            message=f"Table '{table.name}' fetches from GET {table.data_endpoint} but this endpoint does not exist",
                            suggestion=f"Add GET {table.data_endpoint} endpoint to the API schema",
                            related=[f"API.endpoints"],
                        ))

    # ── Check: API ↔ DB consistency ─────────────────────────

    def _check_api_db_consistency(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify that API endpoint fields map to DB columns."""
        db_columns: dict[str, set[str]] = {}
        for table in comp.db_schema.tables:
            db_columns[table.name] = {col.name for col in table.columns}

        # Check POST/PUT endpoints — request fields should have DB columns
        for ep in comp.api_schema.endpoints:
            if ep.method in ("POST", "PUT") and ep.request_fields:
                # Try to infer table name from endpoint path
                table_name = self._infer_table_name(ep.path)
                if table_name and table_name in db_columns:
                    for field in ep.request_fields:
                        if field.name not in db_columns[table_name]:
                            # Not every API field maps directly to DB (e.g., password vs password_hash)
                            warnings.append(self._make_error(
                                error_type=ValidationErrorType.SCHEMA_MISMATCH,
                                severity=ValidationSeverity.WARNING,
                                location=f"API.{ep.path}.{field.name}",
                                message=f"API field '{field.name}' in {ep.method.value} {ep.path} has no matching column in table '{table_name}'",
                                suggestion=f"Add column '{field.name}' to table '{table_name}' or verify the field is handled by business logic",
                                related=[f"DB.{table_name}"],
                            ))

    # ── Check: Role consistency ──────────────────────────────

    def _check_role_consistency(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify that all role references point to existing roles."""
        # Collect all defined roles
        defined_roles: set[str] = set()
        if comp.auth_schema:
            for rule in comp.auth_schema.rbac_rules:
                defined_roles.add(rule.role)

        if comp.intent:
            for role in comp.intent.roles:
                defined_roles.add(role)

        # Check API endpoint role references
        if comp.api_schema:
            for ep in comp.api_schema.endpoints:
                for role in ep.allowed_roles:
                    if role not in defined_roles:
                        errors.append(self._make_error(
                            error_type=ValidationErrorType.ROLE_NOT_FOUND,
                            severity=ValidationSeverity.ERROR,
                            location=f"API.{ep.path}.allowed_roles",
                            message=f"Role '{role}' referenced in endpoint {ep.path} is not defined",
                            suggestion=f"Add role '{role}' to the auth schema or fix the role name",
                            related=["Auth.rbac_rules"],
                        ))

        # Check UI page role references
        if comp.ui_schema:
            for page in comp.ui_schema.pages:
                for role in page.allowed_roles:
                    if role not in defined_roles:
                        errors.append(self._make_error(
                            error_type=ValidationErrorType.ROLE_NOT_FOUND,
                            severity=ValidationSeverity.ERROR,
                            location=f"UI.{page.name}.allowed_roles",
                            message=f"Role '{role}' referenced in page '{page.name}' is not defined",
                            suggestion=f"Add role '{role}' to the auth schema",
                            related=["Auth.rbac_rules"],
                        ))

    # ── Check: Foreign key validity ──────────────────────────

    def _check_foreign_keys(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify that all foreign keys reference existing tables and columns."""
        table_names = {t.name for t in comp.db_schema.tables}
        table_columns: dict[str, set[str]] = {}
        for table in comp.db_schema.tables:
            table_columns[table.name] = {col.name for col in table.columns}

        for table in comp.db_schema.tables:
            for fk in table.foreign_keys:
                if fk.references_table not in table_names:
                    errors.append(self._make_error(
                        error_type=ValidationErrorType.FOREIGN_KEY_MISMATCH,
                        severity=ValidationSeverity.ERROR,
                        location=f"DB.{table.name}.{fk.column}",
                        message=f"Foreign key in '{table.name}.{fk.column}' references non-existent table '{fk.references_table}'",
                        suggestion=f"Create table '{fk.references_table}' or fix the foreign key reference",
                        related=[f"DB.{fk.references_table}"],
                    ))
                elif fk.references_column not in table_columns.get(fk.references_table, set()):
                    errors.append(self._make_error(
                        error_type=ValidationErrorType.FOREIGN_KEY_MISMATCH,
                        severity=ValidationSeverity.ERROR,
                        location=f"DB.{table.name}.{fk.column}",
                        message=f"Foreign key references non-existent column '{fk.references_table}.{fk.references_column}'",
                        suggestion=f"Add column '{fk.references_column}' to table '{fk.references_table}'",
                        related=[f"DB.{fk.references_table}.{fk.references_column}"],
                    ))

                # Check that the FK column exists in the source table
                if fk.column not in table_columns.get(table.name, set()):
                    errors.append(self._make_error(
                        error_type=ValidationErrorType.MISSING_COLUMN,
                        severity=ValidationSeverity.ERROR,
                        location=f"DB.{table.name}.{fk.column}",
                        message=f"Foreign key column '{fk.column}' does not exist in table '{table.name}'",
                        suggestion=f"Add column '{fk.column}' to table '{table.name}'",
                    ))

    # ── Check: Route guards ──────────────────────────────────

    def _check_route_guards(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify route guards match UI page routes."""
        ui_routes = {p.route for p in comp.ui_schema.pages if p.requires_auth}
        guarded_routes = {g.route for g in comp.auth_schema.route_guards}

        for route in ui_routes:
            if route not in guarded_routes:
                warnings.append(self._make_error(
                    error_type=ValidationErrorType.MISSING_AUTH_GUARD,
                    severity=ValidationSeverity.WARNING,
                    location=f"Auth.route_guards.{route}",
                    message=f"Protected page '{route}' has no route guard defined",
                    suggestion=f"Add a route guard for '{route}' in the auth schema",
                    related=[f"UI.{route}"],
                ))

    # ── Check: Feature completeness ──────────────────────────

    def _check_feature_completeness(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify that required features from intent are represented in schemas."""
        if not comp.intent:
            return

        # If payments required, check for payment-related endpoints
        if comp.intent.requires_payments and comp.api_schema:
            has_payment_ep = any(
                "payment" in ep.path.lower() or "subscription" in ep.path.lower()
                for ep in comp.api_schema.endpoints
            )
            if not has_payment_ep:
                warnings.append(self._make_error(
                    error_type=ValidationErrorType.INCONSISTENT_FEATURE,
                    severity=ValidationSeverity.WARNING,
                    location="API.endpoints",
                    message="Payments required but no payment/subscription endpoints found",
                    suggestion="Add payment processing endpoints to the API schema",
                    related=["Intent.requires_payments"],
                ))

        # If analytics required, check for analytics endpoints
        if comp.intent.requires_analytics and comp.api_schema:
            has_analytics = any(
                "analytics" in ep.path.lower() or "stats" in ep.path.lower()
                for ep in comp.api_schema.endpoints
            )
            if not has_analytics:
                warnings.append(self._make_error(
                    error_type=ValidationErrorType.INCONSISTENT_FEATURE,
                    severity=ValidationSeverity.WARNING,
                    location="API.endpoints",
                    message="Analytics required but no analytics/stats endpoints found",
                    suggestion="Add analytics endpoints to the API schema",
                    related=["Intent.requires_analytics"],
                ))

    # ── Check: Table structure ───────────────────────────────

    def _check_table_structure(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify that all tables have proper structure."""
        for table in comp.db_schema.tables:
            column_names = {col.name for col in table.columns}

            # Every table should have an id
            if "id" not in column_names:
                errors.append(self._make_error(
                    error_type=ValidationErrorType.MISSING_COLUMN,
                    severity=ValidationSeverity.ERROR,
                    location=f"DB.{table.name}.id",
                    message=f"Table '{table.name}' is missing 'id' primary key column",
                    suggestion=f"Add 'id' UUID primary key column to table '{table.name}'",
                ))

            # Every table should have timestamps
            if "created_at" not in column_names:
                warnings.append(self._make_error(
                    error_type=ValidationErrorType.MISSING_COLUMN,
                    severity=ValidationSeverity.WARNING,
                    location=f"DB.{table.name}.created_at",
                    message=f"Table '{table.name}' is missing 'created_at' timestamp column",
                    suggestion="Add 'created_at' TIMESTAMP column with default NOW()",
                ))

            # Check for duplicate column names
            seen_columns: set[str] = set()
            for col in table.columns:
                if col.name in seen_columns:
                    errors.append(self._make_error(
                        error_type=ValidationErrorType.DUPLICATE_DEFINITION,
                        severity=ValidationSeverity.ERROR,
                        location=f"DB.{table.name}.{col.name}",
                        message=f"Duplicate column '{col.name}' in table '{table.name}'",
                        suggestion=f"Remove the duplicate column definition",
                    ))
                seen_columns.add(col.name)

    # ── Check: Endpoint structure ────────────────────────────

    def _check_endpoint_structure(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Verify API endpoint structure."""
        # Check for duplicate endpoints (same path + method)
        seen_endpoints: set[tuple[str, str]] = set()
        for ep in comp.api_schema.endpoints:
            key = (ep.path, ep.method.value)
            if key in seen_endpoints:
                errors.append(self._make_error(
                    error_type=ValidationErrorType.DUPLICATE_DEFINITION,
                    severity=ValidationSeverity.ERROR,
                    location=f"API.{ep.path}.{ep.method.value}",
                    message=f"Duplicate endpoint: {ep.method.value} {ep.path}",
                    suggestion="Remove the duplicate endpoint definition",
                ))
            seen_endpoints.add(key)

    # ── Helpers ──────────────────────────────────────────────

    @staticmethod
    def _infer_table_name(api_path: str) -> str | None:
        """Infer database table name from API path.

        /api/v1/contacts → contacts
        /api/v1/contacts/{id} → contacts
        """
        parts = api_path.strip("/").split("/")
        # Filter out version segments and path params
        resource_parts = [
            p for p in parts
            if p not in ("api", "v1", "v2") and not p.startswith("{")
        ]
        return resource_parts[0] if resource_parts else None

    # ── Check: Hallucinated fields ───────────────────────

    def _check_hallucinated_fields(
        self,
        comp: CompilationResult,
        errors: list[ValidationError],
        warnings: list[ValidationError],
    ) -> None:
        """Detect hallucinated fields — DB columns or API fields that don't
        trace back to any entity field in the architecture.

        This catches LLM-invented fields that exist in schemas but were
        never requested in the intent or designed in the architecture.
        """
        # Build set of valid field names from architecture entities
        valid_fields: set[str] = set()
        entity_field_map: dict[str, set[str]] = {}
        for entity in comp.architecture.entities:
            entity_fields = {f.name for f in entity.fields}
            entity_field_map[entity.name.lower()] = entity_fields
            valid_fields.update(entity_fields)

        # Common infrastructure fields that are always valid
        infra_fields = {
            "id", "created_at", "updated_at", "deleted_at",
            "access_token", "refresh_token", "status", "items",
            "total", "page", "limit", "user", "token",
        }
        valid_fields.update(infra_fields)

        # Check DB columns against architecture
        if comp.db_schema:
            for table in comp.db_schema.tables:
                # Try to match table to entity
                table_lower = table.name.lower().rstrip("s")  # users -> user
                matched_entity_fields = None
                for ename, efields in entity_field_map.items():
                    if ename.lower() == table_lower or ename.lower() + "s" == table.name.lower():
                        matched_entity_fields = efields
                        break

                if matched_entity_fields:
                    for col in table.columns:
                        if (
                            col.name not in matched_entity_fields
                            and col.name not in infra_fields
                            and not col.name.endswith("_id")  # FK columns are valid
                        ):
                            warnings.append(self._make_error(
                                error_type=ValidationErrorType.INCONSISTENT_FEATURE,
                                severity=ValidationSeverity.WARNING,
                                location=f"DB.{table.name}.{col.name}",
                                message=(
                                    f"Column '{col.name}' in table '{table.name}' does not map "
                                    f"to any field in the architecture entity. Possible hallucination."
                                ),
                                suggestion=(
                                    f"Verify that '{col.name}' is intentional. If not, "
                                    f"remove it to keep schemas consistent with the design."
                                ),
                                related=[f"Architecture.{table_lower}"],
                            ))


# Singleton
validator = Validator()
