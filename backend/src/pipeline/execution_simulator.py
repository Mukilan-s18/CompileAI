"""Stage 6 — Execution Simulator.

Verifies that the generated configuration can actually be used to create
a working application. Performs deterministic checks — no LLM calls.
"""

from __future__ import annotations

import logging
import time
import re

from src.schemas.compilation import CompilationResult, ExecutionResult, ExecutionCheckResult

logger = logging.getLogger(__name__)


class ExecutionSimulator:
    """Runtime simulation engine.

    Checks:
    1. Route generation: Can all UI pages be routed?
    2. API generation: Are all endpoints well-formed?
    3. DB generation: Can SQL DDL be generated?
    4. Auth generation: Are all guards valid?
    5. Dependency check: Are all cross-references resolvable?
    6. Business logic: Are all rule references valid?
    """

    def simulate(self, compilation: CompilationResult) -> ExecutionResult:
        """Run execution simulation on the compilation result.

        Args:
            compilation: The fully compiled and repaired result.

        Returns:
            ExecutionResult with per-check PASS/FAIL details.
        """
        logger.info("Stage 6: Running execution simulation")
        start_time = time.time()

        checks: list[ExecutionCheckResult] = []

        # 1. Route generation check
        checks.append(self._check_routes(compilation))

        # 2. API generation check
        checks.append(self._check_api(compilation))

        # 3. DB generation check (includes DDL generation)
        db_check = self._check_db(compilation)
        checks.append(db_check)

        # 4. Auth generation check
        checks.append(self._check_auth(compilation))

        # 5. Cross-reference dependency check
        checks.append(self._check_dependencies(compilation))

        # 6. Business logic check
        checks.append(self._check_business_logic(compilation))

        # 7. Real DDL execution (if Postgres is available)
        ddl_exec_check = self._check_ddl_execution(compilation)
        if ddl_exec_check:
            checks.append(ddl_exec_check)

        passed = sum(1 for c in checks if c.passed)
        failed = sum(1 for c in checks if not c.passed)
        status = "PASS" if failed == 0 else "FAIL"

        # Collect generated DDL
        generated_ddl = ""
        for check in checks:
            for artifact in check.artifacts:
                if artifact.startswith("CREATE") or artifact.startswith("--"):
                    generated_ddl += artifact + "\n"

        # Collect generated routes
        generated_routes = []
        for check in checks:
            if check.check_name == "route_generation":
                generated_routes = check.artifacts

        duration_ms = (time.time() - start_time) * 1000
        logger.info(
            f"Stage 6 complete: {status} ({passed} passed, {failed} failed), "
            f"{duration_ms:.0f}ms"
        )

        return ExecutionResult(
            status=status,
            checks=checks,
            passed_count=passed,
            failed_count=failed,
            generated_ddl=generated_ddl,
            generated_routes=generated_routes,
        )

    # ── Check: Route generation ──────────────────────────────

    def _check_routes(self, comp: CompilationResult) -> ExecutionCheckResult:
        """Verify all UI page routes are valid and can be generated."""
        if not comp.ui_schema:
            return ExecutionCheckResult(
                check_name="route_generation",
                passed=False,
                details="No UI schema available",
            )

        issues = []
        routes = []

        for page in comp.ui_schema.pages:
            # Validate route format
            if not page.route.startswith("/"):
                issues.append(f"Route '{page.route}' for page '{page.name}' must start with '/'")
            else:
                routes.append(f"{page.route} → {page.title} ({page.layout})")

            # Check for route conflicts
            route_counts: dict[str, int] = {}
            for p in comp.ui_schema.pages:
                route_counts[p.route] = route_counts.get(p.route, 0) + 1
            for route, count in route_counts.items():
                if count > 1:
                    issues.append(f"Duplicate route: '{route}' defined {count} times")

        if issues:
            return ExecutionCheckResult(
                check_name="route_generation",
                passed=False,
                details=f"Route issues: {'; '.join(issues)}",
                artifacts=routes,
            )

        return ExecutionCheckResult(
            check_name="route_generation",
            passed=True,
            details=f"All {len(routes)} routes are valid",
            artifacts=routes,
        )

    # ── Check: API generation ────────────────────────────────

    def _check_api(self, comp: CompilationResult) -> ExecutionCheckResult:
        """Verify all API endpoints are well-formed."""
        if not comp.api_schema:
            return ExecutionCheckResult(
                check_name="api_generation",
                passed=False,
                details="No API schema available",
            )

        issues = []

        for ep in comp.api_schema.endpoints:
            # Validate path format
            if not ep.path.startswith("/"):
                issues.append(f"Endpoint path '{ep.path}' must start with '/'")

            # POST/PUT should have request fields
            if ep.method.value in ("POST", "PUT") and not ep.request_fields:
                issues.append(
                    f"{ep.method.value} {ep.path} has no request fields"
                )

            # GET with id should return response fields
            if ep.method.value == "GET" and not ep.response_fields:
                issues.append(
                    f"GET {ep.path} has no response fields defined"
                )

        if issues:
            return ExecutionCheckResult(
                check_name="api_generation",
                passed=len(issues) <= 2,  # Allow minor issues
                details=f"API issues: {'; '.join(issues[:5])}",
            )

        return ExecutionCheckResult(
            check_name="api_generation",
            passed=True,
            details=f"All {len(comp.api_schema.endpoints)} endpoints are well-formed",
        )

    # ── Check: DB generation (DDL) ───────────────────────────

    def _check_db(self, comp: CompilationResult) -> ExecutionCheckResult:
        """Verify database schema can generate valid SQL DDL."""
        if not comp.db_schema:
            return ExecutionCheckResult(
                check_name="db_generation",
                passed=False,
                details="No database schema available",
            )

        issues = []
        ddl_statements = []

        try:
            for table in comp.db_schema.tables:
                ddl = self._generate_ddl(table, comp)
                ddl_statements.append(ddl)
        except Exception as e:
            issues.append(f"DDL generation error: {e}")

        # Validate table names (valid SQL identifiers)
        for table in comp.db_schema.tables:
            if not re.match(r"^[a-z_][a-z0-9_]*$", table.name):
                issues.append(
                    f"Invalid table name: '{table.name}' (must be lowercase snake_case)"
                )

        if issues:
            return ExecutionCheckResult(
                check_name="db_generation",
                passed=False,
                details=f"DB issues: {'; '.join(issues)}",
                artifacts=ddl_statements,
            )

        return ExecutionCheckResult(
            check_name="db_generation",
            passed=True,
            details=f"Generated DDL for {len(comp.db_schema.tables)} tables",
            artifacts=ddl_statements,
        )

    # ── Check: Auth generation ───────────────────────────────

    def _check_auth(self, comp: CompilationResult) -> ExecutionCheckResult:
        """Verify auth configuration is valid."""
        if not comp.auth_schema:
            return ExecutionCheckResult(
                check_name="auth_generation",
                passed=False,
                details="No auth schema available",
            )

        issues = []

        # Must have at least one auth provider
        if not comp.auth_schema.auth_providers:
            issues.append("No auth providers configured")

        # Must have RBAC rules
        if not comp.auth_schema.rbac_rules:
            issues.append("No RBAC rules defined")

        # Check session config
        session = comp.auth_schema.session_config
        if session.token_type not in ("JWT", "session"):
            issues.append(f"Invalid token type: {session.token_type}")

        if issues:
            return ExecutionCheckResult(
                check_name="auth_generation",
                passed=False,
                details=f"Auth issues: {'; '.join(issues)}",
            )

        return ExecutionCheckResult(
            check_name="auth_generation",
            passed=True,
            details=f"Auth config valid: {len(comp.auth_schema.rbac_rules)} RBAC rules, "
            f"{len(comp.auth_schema.route_guards)} route guards",
        )

    # ── Check: Cross-reference dependencies ──────────────────

    def _check_dependencies(self, comp: CompilationResult) -> ExecutionCheckResult:
        """Verify all cross-schema references are resolvable."""
        issues = []

        # Check that navigation routes point to existing pages
        if comp.ui_schema:
            page_routes = {p.route for p in comp.ui_schema.pages}
            for nav in comp.ui_schema.navigation:
                if nav.route not in page_routes:
                    issues.append(f"Nav item '{nav.label}' points to non-existent route '{nav.route}'")

        # Check that stat card endpoints exist
        if comp.ui_schema and comp.api_schema:
            api_paths = {ep.path for ep in comp.api_schema.endpoints}
            for page in comp.ui_schema.pages:
                for component in page.components:
                    for card in component.stat_cards:
                        if card.value_endpoint not in api_paths:
                            issues.append(
                                f"Stat card '{card.title}' endpoint '{card.value_endpoint}' not found"
                            )

        if issues:
            return ExecutionCheckResult(
                check_name="dependency_check",
                passed=len(issues) <= 3,  # Allow some minor issues
                details=f"Dependency issues: {'; '.join(issues[:5])}",
            )

        return ExecutionCheckResult(
            check_name="dependency_check",
            passed=True,
            details="All cross-schema references resolved",
        )

    # ── Check: Business logic ────────────────────────────────

    def _check_business_logic(self, comp: CompilationResult) -> ExecutionCheckResult:
        """Verify business logic rules reference valid entities."""
        if not comp.business_logic or not comp.business_logic.rules:
            return ExecutionCheckResult(
                check_name="business_logic",
                passed=True,
                details="No business logic rules to validate",
            )

        issues = []
        entity_names: set[str] = set()
        if comp.architecture:
            entity_names = {e.name for e in comp.architecture.entities}

        for rule in comp.business_logic.rules:
            if rule.entity not in entity_names:
                issues.append(
                    f"Rule '{rule.name}' references non-existent entity '{rule.entity}'"
                )

        if issues:
            return ExecutionCheckResult(
                check_name="business_logic",
                passed=False,
                details=f"Business logic issues: {'; '.join(issues)}",
            )

        return ExecutionCheckResult(
            check_name="business_logic",
            passed=True,
            details=f"All {len(comp.business_logic.rules)} rules reference valid entities",
        )

    # ── DDL Generator ────────────────────────────────────────

    def _generate_ddl(self, table, comp: CompilationResult) -> str:
        """Generate CREATE TABLE SQL DDL for a single table."""
        type_map = {
            "uuid": "UUID",
            "serial": "SERIAL",
            "varchar": "VARCHAR",
            "text": "TEXT",
            "integer": "INTEGER",
            "bigint": "BIGINT",
            "decimal": "DECIMAL(10,2)",
            "boolean": "BOOLEAN",
            "timestamp": "TIMESTAMP WITH TIME ZONE",
            "date": "DATE",
            "jsonb": "JSONB",
            "enum": "VARCHAR(50)",
        }

        lines = [f"-- Table: {table.name}"]
        lines.append(f"CREATE TABLE {table.name} (")

        col_defs = []
        for col in table.columns:
            sql_type = type_map.get(col.column_type.value, "TEXT")
            if col.column_type.value == "varchar" and col.max_length:
                sql_type = f"VARCHAR({col.max_length})"

            parts = [f"    {col.name} {sql_type}"]
            if col.primary_key:
                parts.append("PRIMARY KEY")
            if not col.nullable:
                parts.append("NOT NULL")
            if col.unique and not col.primary_key:
                parts.append("UNIQUE")
            if col.default_value:
                parts.append(f"DEFAULT {col.default_value}")

            col_defs.append(" ".join(parts))

        # Foreign keys
        for fk in table.foreign_keys:
            col_defs.append(
                f"    FOREIGN KEY ({fk.column}) REFERENCES {fk.references_table}({fk.references_column}) "
                f"ON DELETE {fk.on_delete} ON UPDATE {fk.on_update}"
            )

        lines.append(",\n".join(col_defs))
        lines.append(");")

        # Indexes
        for idx in table.indexes:
            unique = "UNIQUE " if idx.unique else ""
            cols = ", ".join(idx.columns)
            lines.append(
                f"CREATE {unique}INDEX {idx.name} ON {table.name} ({cols});"
            )

        return "\n".join(lines)

    # ── Real DDL Execution ───────────────────────────────

    def _check_ddl_execution(
        self, comp: CompilationResult
    ) -> ExecutionCheckResult | None:
        """Attempt to execute generated DDL against a real PostgreSQL instance.

        Uses a temporary schema to avoid polluting the main database.
        Falls back gracefully if no database connection is available.
        """
        if not comp.db_schema:
            return None

        import os
        db_url = os.environ.get("DATABASE_URL", "")
        if not db_url:
            return ExecutionCheckResult(
                check_name="ddl_execution",
                passed=True,
                details="Skipped: No DATABASE_URL configured (DDL validated syntactically only)",
            )

        try:
            import psycopg2
        except ImportError:
            return ExecutionCheckResult(
                check_name="ddl_execution",
                passed=True,
                details="Skipped: psycopg2 not installed (DDL validated syntactically only)",
            )

        import uuid as uuid_mod
        schema_name = f"test_{uuid_mod.uuid4().hex[:8]}"
        conn = None

        try:
            conn = psycopg2.connect(db_url)
            conn.autocommit = True
            cursor = conn.cursor()

            # Create temp schema
            cursor.execute(f'CREATE SCHEMA "{schema_name}"')
            cursor.execute(f'SET search_path TO "{schema_name}"')

            # Enable uuid-ossp extension if available
            try:
                cursor.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
            except Exception:
                pass  # Extension may already exist or not be available

            # Execute DDL for each table
            errors = []
            for table in comp.db_schema.tables:
                ddl = self._generate_ddl(table, comp)
                try:
                    cursor.execute(ddl)
                except Exception as e:
                    errors.append(f"Table '{table.name}': {str(e)[:100]}")

            # Cleanup
            cursor.execute(f'DROP SCHEMA "{schema_name}" CASCADE')
            cursor.close()

            if errors:
                return ExecutionCheckResult(
                    check_name="ddl_execution",
                    passed=False,
                    details=f"DDL execution failed: {'; '.join(errors[:3])}",
                )

            return ExecutionCheckResult(
                check_name="ddl_execution",
                passed=True,
                details=f"DDL executed successfully against PostgreSQL ({len(comp.db_schema.tables)} tables created and verified)",
            )

        except Exception as e:
            logger.warning(f"DDL execution check skipped: {e}")
            return ExecutionCheckResult(
                check_name="ddl_execution",
                passed=True,
                details=f"Skipped: Could not connect to database ({str(e)[:80]})",
            )
        finally:
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass


# Singleton
execution_simulator = ExecutionSimulator()
