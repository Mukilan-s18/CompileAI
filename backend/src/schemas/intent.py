"""Intent extraction schema models.

Stage 1 output: Structured representation of natural language requirements.
All fields are strictly typed — no free-text blobs allowed.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class FeatureCategory(str, Enum):
    """Categories for application features."""
    CORE = "core"
    AUTH = "auth"
    PAYMENT = "payment"
    ANALYTICS = "analytics"
    INTEGRATION = "integration"
    UI = "ui"
    COMMUNICATION = "communication"
    STORAGE = "storage"


class Feature(BaseModel):
    """A single application feature extracted from the prompt."""
    name: str = Field(..., description="Short feature name, e.g. 'Contact Management'")
    description: str = Field(..., description="One-line description of what this feature does")
    category: FeatureCategory = Field(..., description="Feature category classification")
    priority: str = Field(
        default="must-have",
        description="Priority level: must-have, should-have, nice-to-have",
    )


class IntentModel(BaseModel):
    """Structured intent extracted from a natural language product prompt.

    This is the Stage 1 output of the compiler pipeline.
    Every field is strictly typed — the LLM must conform to this schema.
    """
    app_name: str = Field(..., description="Application name derived from the prompt")
    domain: str = Field(
        ...,
        description="Application domain: CRM, HRMS, Ecommerce, LMS, Inventory, Healthcare, "
        "SocialMedia, ProjectManagement, Analytics, Booking, Custom",
    )
    description: str = Field(..., description="One-paragraph summary of the application")
    features: list[Feature] = Field(
        ..., min_length=1, description="List of extracted features"
    )
    roles: list[str] = Field(
        ..., min_length=1, description="User roles, e.g. ['Admin', 'Manager', 'User']"
    )
    requires_authentication: bool = Field(
        ..., description="Whether the app needs user authentication"
    )
    requires_payments: bool = Field(
        ..., description="Whether the app needs payment processing"
    )
    requires_analytics: bool = Field(
        ..., description="Whether the app needs analytics/reporting"
    )
    target_platforms: list[str] = Field(
        default=["web"], description="Target platforms: web, mobile, desktop"
    )
    assumptions: list[str] = Field(
        default_factory=list,
        description="Assumptions made when the prompt was vague or incomplete",
    )
