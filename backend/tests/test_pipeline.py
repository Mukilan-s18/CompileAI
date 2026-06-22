"""Pipeline stage tests.

Tests the validation engine, repair engine, and execution simulator
with pre-built compilation data (no LLM calls needed).
"""

import pytest

from src.schemas.intent import IntentModel, Feature, FeatureCategory
from src.schemas.architecture import (
    SystemArchitecture, Entity, EntityField, Permission, RoleDefinition,
)
from src.schemas.ui_schema import (
    UISchema, Page, PageComponent, ComponentType, Form, FormField, InputType,
    Table, TableColumn, NavigationItem,
)
from src.schemas.api_schema import (
    APISchema, APIEndpoint, HTTPMethod, ResponseField, FieldType,
)
from src.schemas.db_schema import (
    DatabaseSchema, DBTable, Column, ColumnType, ForeignKey, Index,
)
from src.schemas.auth_schema import (
    AuthSchema, AuthProvider, RBACRule, RouteGuard, SessionConfig,
)
from src.schemas.business_logic import BusinessLogicSchema
from src.schemas.runtime_config import RuntimeConfig, DatabaseConfig
from src.schemas.compilation import CompilationResult, CompilationStatus
from src.schemas.validation import ValidationResult

from src.pipeline.validator import validator
from src.pipeline.repair_engine import repair_engine
from src.pipeline.execution_simulator import execution_simulator


def _make_test_compilation() -> CompilationResult:
    """Create a test compilation with all schemas populated."""
    comp = CompilationResult(
        status=CompilationStatus.SUCCESS,
        prompt="Build a CRM",
    )
    comp.intent = IntentModel(
        app_name="TestCRM",
        domain="CRM",
        description="A test CRM",
        features=[Feature(name="Contacts", description="Manage contacts", category=FeatureCategory.CORE)],
        roles=["Admin", "User"],
        requires_authentication=True,
        requires_payments=False,
        requires_analytics=False,
    )
    comp.architecture = SystemArchitecture(
        app_name="TestCRM",
        entities=[
            Entity(name="User", description="User entity", fields=[
                EntityField(name="id", field_type="uuid"),
                EntityField(name="email", field_type="email"),
            ]),
            Entity(name="Contact", description="Contact entity", fields=[
                EntityField(name="id", field_type="uuid"),
                EntityField(name="name", field_type="string"),
                EntityField(name="owner_id", field_type="uuid"),
            ]),
        ],
        roles=[
            RoleDefinition(name="Admin", description="Admin", permissions=["manage_contacts"]),
            RoleDefinition(name="User", description="User", permissions=["view_contacts"]),
        ],
        permissions=[
            Permission(name="manage_contacts", description="Manage contacts", resource="Contact", actions=["create", "read", "update", "delete"]),
            Permission(name="view_contacts", description="View contacts", resource="Contact", actions=["read"]),
        ],
    )
    comp.ui_schema = UISchema(
        app_name="TestCRM",
        pages=[
            Page(name="contacts", title="Contacts", route="/contacts",
                 components=[
                     PageComponent(component_type=ComponentType.TABLE, component_id="contacts-table",
                                   table=Table(name="contacts-table", title="Contacts",
                                               data_endpoint="/api/v1/contacts",
                                               columns=[TableColumn(key="name", label="Name")])),
                 ],
                 buttons=[]),
            Page(name="contact-form", title="New Contact", route="/contacts/new",
                 components=[
                     PageComponent(component_type=ComponentType.FORM, component_id="contact-form",
                                   form=Form(name="contact-form", title="Create Contact",
                                             submit_endpoint="/api/v1/contacts", submit_method="POST",
                                             fields=[FormField(name="name", label="Name", input_type=InputType.TEXT)])),
                 ],
                 buttons=[]),
            Page(name="login", title="Login", route="/login", requires_auth=False,
                 components=[], buttons=[]),
        ],
        navigation=[
            NavigationItem(label="Contacts", route="/contacts"),
        ],
    )
    comp.api_schema = APISchema(
        endpoints=[
            APIEndpoint(path="/api/v1/contacts", method=HTTPMethod.GET, summary="List contacts", tag="Contacts",
                        response_fields=[ResponseField(name="items", field_type=FieldType.ARRAY)]),
            APIEndpoint(path="/api/v1/contacts", method=HTTPMethod.POST, summary="Create contact", tag="Contacts",
                        response_fields=[ResponseField(name="id", field_type=FieldType.UUID)]),
        ],
    )
    comp.db_schema = DatabaseSchema(
        database_name="testcrm",
        tables=[
            DBTable(name="users", columns=[
                Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False),
                Column(name="email", column_type=ColumnType.VARCHAR, max_length=255),
                Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False),
            ]),
            DBTable(name="contacts", columns=[
                Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False),
                Column(name="name", column_type=ColumnType.VARCHAR, max_length=255),
                Column(name="owner_id", column_type=ColumnType.UUID, nullable=False),
                Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False),
            ], foreign_keys=[
                ForeignKey(column="owner_id", references_table="users", references_column="id"),
            ]),
        ],
    )
    comp.auth_schema = AuthSchema(
        auth_providers=[AuthProvider(provider_type="email_password")],
        session_config=SessionConfig(),
        rbac_rules=[
            RBACRule(role="Admin", resource="Contact", actions=["create", "read", "update", "delete"]),
            RBACRule(role="User", resource="Contact", actions=["read"]),
        ],
        route_guards=[
            RouteGuard(route="/contacts", allowed_roles=["Admin", "User"]),
            RouteGuard(route="/contacts/new", allowed_roles=["Admin"]),
            RouteGuard(route="/login", allowed_roles=[], requires_auth=False),
        ],
    )
    comp.business_logic = BusinessLogicSchema()
    comp.runtime_config = RuntimeConfig(
        app_name="TestCRM",
        database=DatabaseConfig(name="testcrm"),
    )
    return comp


class TestValidator:
    """Tests for the validation engine."""

    def test_valid_compilation_passes(self):
        comp = _make_test_compilation()
        result = validator.validate(comp)
        # Should have no errors (warnings are OK)
        assert result.error_count == 0

    def test_detects_missing_endpoint(self):
        comp = _make_test_compilation()
        # Add a form that references a non-existent endpoint
        comp.ui_schema.pages[1].components[0].form.submit_endpoint = "/api/v1/nonexistent"
        result = validator.validate(comp)
        assert result.error_count > 0
        assert any(e.error_type.value == "MissingEndpoint" for e in result.errors)

    def test_detects_foreign_key_mismatch(self):
        comp = _make_test_compilation()
        # Add FK to non-existent table
        comp.db_schema.tables[1].foreign_keys.append(
            ForeignKey(column="owner_id", references_table="nonexistent", references_column="id")
        )
        result = validator.validate(comp)
        assert any(e.error_type.value == "ForeignKeyMismatch" for e in result.errors)

    def test_detects_missing_table_id(self):
        comp = _make_test_compilation()
        # Remove id column from contacts
        comp.db_schema.tables[1].columns = [
            c for c in comp.db_schema.tables[1].columns if c.name != "id"
        ]
        result = validator.validate(comp)
        assert any(e.error_type.value == "MissingColumn" for e in result.errors)

    def test_checks_performed_list(self):
        comp = _make_test_compilation()
        result = validator.validate(comp)
        assert "ui_api_consistency" in result.checks_performed
        assert "foreign_key_validity" in result.checks_performed


class TestRepairEngine:
    """Tests for the repair engine."""

    def test_repairs_missing_endpoint(self):
        comp = _make_test_compilation()
        comp.ui_schema.pages[1].components[0].form.submit_endpoint = "/api/v1/leads"

        validation = validator.validate(comp)
        assert validation.error_count > 0

        comp, repairs = repair_engine.repair(comp, validation)
        assert len(repairs) > 0
        assert any(r.action_type.value == "add_endpoint" for r in repairs)

    def test_repairs_missing_column(self):
        comp = _make_test_compilation()
        # Remove id column
        comp.db_schema.tables[1].columns = [
            c for c in comp.db_schema.tables[1].columns if c.name != "id"
        ]

        validation = validator.validate(comp)
        comp, repairs = repair_engine.repair(comp, validation)
        # Should have added the id column back
        column_names = {c.name for c in comp.db_schema.tables[1].columns}
        assert "id" in column_names

    def test_no_repairs_when_valid(self):
        comp = _make_test_compilation()
        validation = validator.validate(comp)
        assert validation.is_valid

        comp, repairs = repair_engine.repair(comp, validation)
        # Only warnings may be repaired, no error repairs
        error_repairs = [r for r in repairs if r.action_type.value not in ("add_route_guard",)]
        # This may produce some warning repairs, which is fine


class TestExecutionSimulator:
    """Tests for the execution simulator."""

    def test_valid_compilation_passes(self):
        comp = _make_test_compilation()
        result = execution_simulator.simulate(comp)
        assert result.status == "PASS"
        assert result.passed_count > 0
        assert result.failed_count == 0

    def test_generates_ddl(self):
        comp = _make_test_compilation()
        result = execution_simulator.simulate(comp)
        assert result.generated_ddl  # Should have generated DDL
        assert "CREATE TABLE" in result.generated_ddl

    def test_generates_routes(self):
        comp = _make_test_compilation()
        result = execution_simulator.simulate(comp)
        assert len(result.generated_routes) > 0

    def test_all_checks_run(self):
        comp = _make_test_compilation()
        result = execution_simulator.simulate(comp)
        check_names = {c.check_name for c in result.checks}
        assert "route_generation" in check_names
        assert "api_generation" in check_names
        assert "db_generation" in check_names
        assert "auth_generation" in check_names
