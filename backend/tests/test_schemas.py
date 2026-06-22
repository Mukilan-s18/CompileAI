"""Schema validation tests.

Tests that all Pydantic models validate correctly with sample data
and reject invalid inputs.
"""

import pytest
from pydantic import ValidationError

from src.schemas.intent import IntentModel, Feature, FeatureCategory
from src.schemas.architecture import (
    SystemArchitecture, Entity, EntityField, Relationship, RelationshipType,
    Permission, RoleDefinition,
)
from src.schemas.ui_schema import UISchema, Page, NavigationItem
from src.schemas.api_schema import APISchema, APIEndpoint, HTTPMethod
from src.schemas.db_schema import DatabaseSchema, DBTable, Column, ColumnType
from src.schemas.auth_schema import AuthSchema, AuthProvider, RBACRule
from src.schemas.validation import ValidationResult, ValidationError as ValError, ValidationErrorType, ValidationSeverity
from src.schemas.compilation import CompilationResult, CompilationStatus


class TestIntentSchema:
    """Tests for IntentModel validation."""

    def test_valid_intent(self):
        intent = IntentModel(
            app_name="TestCRM",
            domain="CRM",
            description="A test CRM application",
            features=[
                Feature(name="Contacts", description="Manage contacts", category=FeatureCategory.CORE)
            ],
            roles=["Admin", "User"],
            requires_authentication=True,
            requires_payments=False,
            requires_analytics=False,
        )
        assert intent.app_name == "TestCRM"
        assert len(intent.features) == 1
        assert intent.requires_authentication is True

    def test_intent_requires_features(self):
        with pytest.raises(ValidationError):
            IntentModel(
                app_name="Test",
                domain="CRM",
                description="Test",
                features=[],  # min_length=1 violated
                roles=["Admin"],
                requires_authentication=True,
                requires_payments=False,
                requires_analytics=False,
            )

    def test_intent_requires_roles(self):
        with pytest.raises(ValidationError):
            IntentModel(
                app_name="Test",
                domain="CRM",
                description="Test",
                features=[Feature(name="F1", description="D1", category=FeatureCategory.CORE)],
                roles=[],  # min_length=1 violated
                requires_authentication=True,
                requires_payments=False,
                requires_analytics=False,
            )

    def test_intent_assumptions_default_empty(self):
        intent = IntentModel(
            app_name="Test",
            domain="CRM",
            description="Test",
            features=[Feature(name="F1", description="D1", category=FeatureCategory.CORE)],
            roles=["Admin"],
            requires_authentication=True,
            requires_payments=False,
            requires_analytics=False,
        )
        assert intent.assumptions == []

    def test_intent_serialization(self):
        intent = IntentModel(
            app_name="Test",
            domain="CRM",
            description="Test",
            features=[Feature(name="F1", description="D1", category=FeatureCategory.CORE)],
            roles=["Admin"],
            requires_authentication=True,
            requires_payments=False,
            requires_analytics=False,
        )
        json_str = intent.model_dump_json()
        restored = IntentModel.model_validate_json(json_str)
        assert restored.app_name == intent.app_name


class TestArchitectureSchema:
    """Tests for SystemArchitecture validation."""

    def test_valid_architecture(self):
        arch = SystemArchitecture(
            app_name="TestApp",
            entities=[
                Entity(name="User", description="User entity", fields=[
                    EntityField(name="id", field_type="uuid"),
                    EntityField(name="email", field_type="email"),
                ])
            ],
            roles=[RoleDefinition(name="Admin", description="Admin role", permissions=["all"])],
            permissions=[Permission(name="all", description="Full access", resource="User", actions=["create", "read"])],
        )
        assert len(arch.entities) == 1
        assert arch.entities[0].name == "User"

    def test_relationship_types(self):
        rel = Relationship(
            from_entity="User",
            to_entity="Contact",
            relationship_type=RelationshipType.ONE_TO_MANY,
        )
        assert rel.relationship_type == RelationshipType.ONE_TO_MANY


class TestDatabaseSchema:
    """Tests for DatabaseSchema validation."""

    def test_valid_table(self):
        table = DBTable(
            name="users",
            columns=[
                Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False),
                Column(name="email", column_type=ColumnType.VARCHAR, max_length=255),
            ],
        )
        assert len(table.columns) == 2
        assert table.columns[0].primary_key is True

    def test_column_types(self):
        for ct in ColumnType:
            col = Column(name="test", column_type=ct)
            assert col.column_type == ct


class TestValidationSchema:
    """Tests for ValidationResult."""

    def test_valid_result(self):
        result = ValidationResult(
            is_valid=True,
            error_count=0,
            warning_count=1,
            warnings=[
                ValError(
                    error_id="VAL-TEST001",
                    error_type=ValidationErrorType.MISSING_COLUMN,
                    severity=ValidationSeverity.WARNING,
                    location="DB.users.created_at",
                    message="Missing timestamp column",
                    suggestion="Add created_at column",
                )
            ],
        )
        assert result.is_valid is True
        assert len(result.warnings) == 1

    def test_invalid_result(self):
        result = ValidationResult(
            is_valid=False,
            error_count=1,
            errors=[
                ValError(
                    error_id="VAL-TEST002",
                    error_type=ValidationErrorType.FOREIGN_KEY_MISMATCH,
                    severity=ValidationSeverity.ERROR,
                    location="DB.contacts.owner_id",
                    message="FK references missing table",
                    suggestion="Create the referenced table",
                )
            ],
        )
        assert result.is_valid is False


class TestCompilationSchema:
    """Tests for CompilationResult."""

    def test_minimal_compilation(self):
        result = CompilationResult(
            status=CompilationStatus.FAILED,
            prompt="Build a CRM",
        )
        assert result.status == CompilationStatus.FAILED
        assert result.id  # UUID is auto-generated
        assert result.intent is None

    def test_compilation_serialization(self):
        result = CompilationResult(
            status=CompilationStatus.SUCCESS,
            prompt="Build a CRM",
        )
        json_str = result.model_dump_json()
        assert "success" in json_str
