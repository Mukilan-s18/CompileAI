"""Business logic rule models.

Part of Stage 3 output: Rules that govern application behavior,
workflows, automations, and conditional logic.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class RuleTrigger(str, Enum):
    """When a business rule is triggered."""
    ON_CREATE = "on_create"
    ON_UPDATE = "on_update"
    ON_DELETE = "on_delete"
    ON_STATUS_CHANGE = "on_status_change"
    ON_SCHEDULE = "on_schedule"
    ON_THRESHOLD = "on_threshold"
    ON_LOGIN = "on_login"


class RuleAction(str, Enum):
    """What a business rule does when triggered."""
    SEND_EMAIL = "send_email"
    SEND_NOTIFICATION = "send_notification"
    UPDATE_FIELD = "update_field"
    CREATE_RECORD = "create_record"
    VALIDATE = "validate"
    RESTRICT_ACCESS = "restrict_access"
    LOG_AUDIT = "log_audit"
    WEBHOOK = "webhook"
    CALCULATE = "calculate"


class BusinessLogicRule(BaseModel):
    """A single business logic rule."""
    name: str = Field(..., description="Rule name, e.g. 'auto_assign_lead'")
    description: str = Field(..., description="What this rule does")
    entity: str = Field(..., description="Primary entity this rule applies to")
    trigger: RuleTrigger = Field(..., description="When this rule fires")
    condition: str = Field(
        ..., description="Condition expression, e.g. 'status == \"new\" AND priority == \"high\"'"
    )
    action_type: RuleAction = Field(..., description="Action to perform")
    action_config: dict[str, str] = Field(
        default_factory=dict,
        description="Action-specific configuration",
    )
    enabled: bool = Field(default=True, description="Whether rule is active")
    priority: int = Field(
        default=100, description="Execution priority (lower = higher priority)"
    )


class WorkflowStep(BaseModel):
    """A step in an automated workflow."""
    step_number: int = Field(..., description="Step sequence")
    name: str = Field(..., description="Step name")
    action_type: RuleAction = Field(..., description="Action type")
    action_config: dict[str, str] = Field(
        default_factory=dict, description="Step configuration"
    )
    wait_condition: str | None = Field(
        default=None, description="Condition to wait for before proceeding"
    )


class Workflow(BaseModel):
    """An automated multi-step workflow."""
    name: str = Field(..., description="Workflow name")
    description: str = Field(..., description="Workflow description")
    trigger_entity: str = Field(..., description="Entity that triggers the workflow")
    trigger: RuleTrigger = Field(..., description="Trigger event")
    steps: list[WorkflowStep] = Field(..., min_length=1, description="Workflow steps")


class BusinessLogicSchema(BaseModel):
    """Complete business logic specification.

    Part of Stage 3 output.
    """
    rules: list[BusinessLogicRule] = Field(
        default_factory=list, description="Individual business rules"
    )
    workflows: list[Workflow] = Field(
        default_factory=list, description="Automated workflows"
    )
