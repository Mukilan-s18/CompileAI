"""System architecture schema models.

Stage 2 output: Converts structured intent into a full system architecture
with entities, relationships, user flows, permissions, and business rules.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class RelationshipType(str, Enum):
    """Types of entity relationships."""
    ONE_TO_ONE = "one_to_one"
    ONE_TO_MANY = "one_to_many"
    MANY_TO_MANY = "many_to_many"


class EntityField(BaseModel):
    """A field belonging to an entity."""
    name: str = Field(..., description="Field name in snake_case")
    field_type: str = Field(
        ..., description="Data type: string, integer, boolean, datetime, text, decimal, email, url, uuid"
    )
    required: bool = Field(default=True, description="Whether the field is required")
    unique: bool = Field(default=False, description="Whether the field must be unique")
    description: str = Field(default="", description="Brief field description")


class Entity(BaseModel):
    """A domain entity in the system architecture."""
    name: str = Field(..., description="Entity name in PascalCase, e.g. 'User', 'Contact'")
    description: str = Field(..., description="What this entity represents")
    fields: list[EntityField] = Field(..., min_length=1, description="Entity fields")
    is_user_entity: bool = Field(
        default=False, description="Whether this entity represents a user/account"
    )


class Relationship(BaseModel):
    """A relationship between two entities."""
    from_entity: str = Field(..., description="Source entity name")
    to_entity: str = Field(..., description="Target entity name")
    relationship_type: RelationshipType = Field(..., description="Cardinality")
    description: str = Field(default="", description="Relationship description")
    through_entity: str | None = Field(
        default=None, description="Junction table for many-to-many"
    )


class UserFlowStep(BaseModel):
    """A single step in a user flow."""
    step_number: int = Field(..., description="Step sequence number")
    action: str = Field(..., description="What the user does")
    page: str = Field(..., description="Page/screen where action occurs")
    outcome: str = Field(..., description="Expected result of the action")


class UserFlow(BaseModel):
    """A complete user flow through the application."""
    name: str = Field(..., description="Flow name, e.g. 'User Registration'")
    actor: str = Field(..., description="The role performing this flow")
    description: str = Field(..., description="Flow description")
    steps: list[UserFlowStep] = Field(..., min_length=1, description="Ordered steps")


class Permission(BaseModel):
    """A granular permission that can be assigned to roles."""
    name: str = Field(..., description="Permission name, e.g. 'manage_contacts'")
    description: str = Field(..., description="What this permission allows")
    resource: str = Field(..., description="The entity/resource this permission applies to")
    actions: list[str] = Field(
        ..., description="Allowed actions: create, read, update, delete, list, export"
    )


class RoleDefinition(BaseModel):
    """A role with its assigned permissions."""
    name: str = Field(..., description="Role name, e.g. 'Admin'")
    description: str = Field(..., description="Role description")
    permissions: list[str] = Field(
        ..., description="List of permission names assigned to this role"
    )
    is_default: bool = Field(
        default=False, description="Whether this role is assigned by default"
    )


class BusinessRule(BaseModel):
    """A business logic rule that constrains system behavior."""
    name: str = Field(..., description="Rule name")
    description: str = Field(..., description="What the rule enforces")
    entity: str = Field(..., description="Primary entity this rule applies to")
    condition: str = Field(..., description="When the rule triggers")
    action: str = Field(..., description="What happens when the rule triggers")


class SystemArchitecture(BaseModel):
    """Complete system architecture derived from intent.

    This is the Stage 2 output of the compiler pipeline.
    """
    app_name: str = Field(..., description="Application name")
    entities: list[Entity] = Field(..., min_length=1, description="Domain entities")
    relationships: list[Relationship] = Field(
        default_factory=list, description="Entity relationships"
    )
    user_flows: list[UserFlow] = Field(
        default_factory=list, description="Key user flows"
    )
    roles: list[RoleDefinition] = Field(
        ..., min_length=1, description="Roles with permissions"
    )
    permissions: list[Permission] = Field(
        ..., min_length=1, description="All granular permissions"
    )
    business_rules: list[BusinessRule] = Field(
        default_factory=list, description="Business logic rules"
    )
