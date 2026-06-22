"""Authentication and authorization schema models.

Stage 3 output (part 4): Complete auth specification including RBAC rules,
route guards, premium restrictions, and session configuration.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class RBACRule(BaseModel):
    """A role-based access control rule."""
    role: str = Field(..., description="Role name")
    resource: str = Field(..., description="Resource/entity name")
    actions: list[str] = Field(
        ..., description="Allowed actions: create, read, update, delete, list, export"
    )
    conditions: list[str] = Field(
        default_factory=list,
        description="Conditions: own_only, same_team, premium_only",
    )


class RouteGuard(BaseModel):
    """A frontend route guard for page-level access control."""
    route: str = Field(..., description="Route path, e.g. '/admin/analytics'")
    allowed_roles: list[str] = Field(..., description="Roles allowed to access this route")
    redirect_to: str = Field(
        default="/login", description="Redirect path when unauthorized"
    )
    requires_auth: bool = Field(default=True, description="Whether route requires authentication")


class PremiumRestriction(BaseModel):
    """A restriction based on subscription/plan tier."""
    feature: str = Field(..., description="Feature name that is restricted")
    required_plan: str = Field(
        ..., description="Required plan: free, basic, premium, enterprise"
    )
    limit: str | None = Field(
        default=None, description="Usage limit for this plan tier, e.g. '100 contacts'"
    )
    fallback_message: str = Field(
        default="Upgrade your plan to access this feature.",
        description="Message shown when feature is restricted",
    )


class AuthProvider(BaseModel):
    """Authentication provider configuration."""
    provider_type: str = Field(
        ..., description="Provider: email_password, google, github, magic_link"
    )
    enabled: bool = Field(default=True, description="Whether provider is enabled")
    config: dict[str, str] = Field(
        default_factory=dict, description="Provider-specific configuration"
    )


class SessionConfig(BaseModel):
    """Session and token configuration."""
    token_type: str = Field(default="JWT", description="Token type: JWT, session")
    access_token_ttl: str = Field(
        default="15m", description="Access token time-to-live"
    )
    refresh_token_ttl: str = Field(
        default="7d", description="Refresh token time-to-live"
    )
    secure_cookies: bool = Field(default=True, description="Use secure cookies")


class AuthSchema(BaseModel):
    """Complete authentication and authorization specification.

    Stage 3 output (Auth portion).
    """
    auth_providers: list[AuthProvider] = Field(
        ..., min_length=1, description="Authentication providers"
    )
    session_config: SessionConfig = Field(
        default_factory=SessionConfig, description="Session configuration"
    )
    rbac_rules: list[RBACRule] = Field(
        ..., min_length=1, description="RBAC rules"
    )
    route_guards: list[RouteGuard] = Field(
        default_factory=list, description="Frontend route guards"
    )
    premium_restrictions: list[PremiumRestriction] = Field(
        default_factory=list, description="Plan-based feature restrictions"
    )
