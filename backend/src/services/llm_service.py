"""LLM Service — OpenAI + Instructor wrapper for structured output generation.

Provides deterministic, schema-constrained AI completions with retry logic,
token tracking, and mock fallback for development without an API key.
"""

from __future__ import annotations

import logging
import time
from typing import TypeVar

from pydantic import BaseModel

from src.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

# ──────────────────────────────────────────────
# Prompt Templates — Stable for determinism
# ──────────────────────────────────────────────

INTENT_EXTRACTION_PROMPT = """You are an AI application compiler's intent extraction stage.

Analyze the following natural language product requirements and extract a structured intent model.

RULES:
- Extract ALL features mentioned, categorize each one
- Identify ALL user roles (default to ["Admin", "User"] if none specified)
- Determine if authentication, payments, and analytics are needed
- If the prompt is vague, generate reasonable assumptions and list them
- App name should be derived from the domain/context
- Domain should be one of: CRM, HRMS, Ecommerce, LMS, Inventory, Healthcare, SocialMedia, ProjectManagement, Analytics, Booking, Custom
- Be thorough — extract implicit features (e.g., "CRM" implies contact management)

USER PROMPT:
{prompt}"""

SYSTEM_DESIGN_PROMPT = """You are an AI application compiler's system design stage.

Given the following structured intent, design a complete system architecture.

RULES:
- Create entities with properly typed fields (include id, created_at, updated_at on every entity)
- Define relationships between ALL related entities with correct cardinality
- Create user flows for the primary use cases
- Define granular permissions for each entity (CRUD + list + export)
- Assign permissions to roles appropriately (Admin gets all, others get subsets)
- Add business rules for important domain logic
- Entity names must be PascalCase, field names must be snake_case
- Include a User entity if authentication is required
- Include payment-related entities if payments are required

INTENT:
{intent_json}"""

SCHEMA_GENERATION_UI_PROMPT = """You are an AI application compiler's UI schema generation stage.

Generate a complete UI specification for the application.

RULES:
- Create pages for ALL entities (list view + create/edit forms)
- Add a Dashboard page with stats cards and charts if analytics is required
- Add login/register pages if authentication is required
- Create navigation items for all pages
- Forms must have proper field types matching the entity fields
- Tables must have columns matching the entity fields
- Set proper route paths (kebab-case)
- Reference correct API endpoints in forms and tables
- Set role-based visibility where appropriate
- Include action buttons (create, edit, delete)

ARCHITECTURE:
{architecture_json}

INTENT:
{intent_json}"""

SCHEMA_GENERATION_API_PROMPT = """You are an AI application compiler's API schema generation stage.

Generate a complete API specification for the application.

RULES:
- Create CRUD endpoints for ALL entities (GET list, GET by id, POST, PUT, DELETE)
- Add authentication endpoints (login, register, logout, refresh) if auth is required
- Add payment endpoints if payments are required
- Add analytics/stats endpoints if analytics is required
- Use RESTful conventions: /api/v1/{{entity_plural}}
- Set proper request/response fields matching entity fields
- Mark auth requirements and role restrictions
- Include query params for list endpoints (page, limit, search, sort)
- Response fields should include id, created_at, updated_at
- Use proper HTTP methods and status codes

ARCHITECTURE:
{architecture_json}

INTENT:
{intent_json}"""

SCHEMA_GENERATION_DB_PROMPT = """You are an AI application compiler's database schema generation stage.

Generate a complete PostgreSQL database specification.

RULES:
- Create tables for ALL entities (use snake_case plural names)
- Every table must have: id (uuid, primary key, default gen_random_uuid()), created_at (timestamp), updated_at (timestamp)
- Add proper foreign keys for ALL relationships
- Add indexes on foreign key columns and frequently queried fields
- Use appropriate column types (uuid, varchar, text, integer, decimal, boolean, timestamp, jsonb)
- Add unique constraints where appropriate (email, username)
- Add check constraints for enums and ranges
- Set NOT NULL on required fields
- CASCADE deletes for dependent records, SET NULL for optional references

ARCHITECTURE:
{architecture_json}

INTENT:
{intent_json}"""

SCHEMA_GENERATION_AUTH_PROMPT = """You are an AI application compiler's auth schema generation stage.

Generate a complete authentication and authorization specification.

RULES:
- Create auth providers based on intent (email/password is always included)
- Create RBAC rules for every role-resource combination
- Create route guards for all protected pages
- Add premium restrictions if payments are required
- JWT configuration with sensible defaults
- Admin role should have full access
- Default role should have limited access
- Add conditions like "own_only" where appropriate (users can only edit their own records)

ARCHITECTURE:
{architecture_json}

INTENT:
{intent_json}"""


class LLMService:
    """Wrapper around OpenAI + Instructor for structured LLM output.

    Features:
    - Schema-constrained decoding via Instructor
    - Temperature=0 for deterministic output
    - Retry with exponential backoff
    - Token usage tracking
    - Mock fallback when no API key is configured
    """

    def __init__(self) -> None:
        self._client = None
        self._mock_mode = False
        self.total_tokens_used = 0

        if not settings.openai_api_key:
            logger.warning("No OpenAI API key configured — running in mock mode")
            self._mock_mode = True
        else:
            self._init_client()

    def _init_client(self) -> None:
        """Initialize the OpenAI + Instructor client."""
        try:
            import instructor
            from openai import OpenAI

            openai_client = OpenAI(api_key=settings.openai_api_key)
            self._client = instructor.from_openai(openai_client)
            logger.info(f"LLM service initialized with model: {settings.openai_model}")
        except ImportError:
            logger.warning("instructor or openai not installed — running in mock mode")
            self._mock_mode = True

    def extract_structured(
        self,
        prompt: str,
        response_model: type[T],
        system_prompt: str = "You are a precise AI application compiler.",
        max_retries: int | None = None,
    ) -> tuple[T, int]:
        """Extract structured data from a prompt using the LLM.

        Args:
            prompt: The formatted prompt to send.
            response_model: Pydantic model class for structured output.
            system_prompt: System message for the LLM.
            max_retries: Override default retry count.

        Returns:
            Tuple of (parsed model instance, tokens used).
        """
        retries = max_retries or settings.max_retries

        if self._mock_mode:
            return self._mock_extract(response_model), 0

        last_error = None
        for attempt in range(retries):
            try:
                result = self._client.chat.completions.create(
                    model=settings.openai_model,
                    response_model=response_model,
                    temperature=settings.temperature,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    max_retries=2,
                )
                # Track token usage (instructor wraps the response)
                tokens = 0
                if hasattr(result, "_raw_response"):
                    usage = result._raw_response.usage
                    if usage:
                        tokens = usage.total_tokens
                self.total_tokens_used += tokens
                return result, tokens

            except Exception as e:
                last_error = e
                wait_time = 2 ** attempt
                logger.warning(
                    f"LLM call failed (attempt {attempt + 1}/{retries}): {e}. "
                    f"Retrying in {wait_time}s..."
                )
                time.sleep(wait_time)

        logger.error(f"LLM extraction failed after {retries} retries: {last_error}")
        raise RuntimeError(
            f"Failed to extract {response_model.__name__} after {retries} retries: {last_error}"
        )

    def _mock_extract(self, response_model: type[T]) -> T:
        """Generate a mock response for development without an API key.

        Uses the Pydantic model's schema to generate realistic sample data.
        """
        from src.schemas.intent import IntentModel, Feature, FeatureCategory
        from src.schemas.architecture import (
            SystemArchitecture, Entity, EntityField, Relationship,
            RelationshipType, UserFlow, UserFlowStep, Permission,
            RoleDefinition, BusinessRule,
        )
        from src.schemas.ui_schema import (
            UISchema, Page, PageComponent, ComponentType, Form, FormField,
            InputType, Table, TableColumn, Button, NavigationItem, StatCard,
            ChartConfig,
        )
        from src.schemas.api_schema import (
            APISchema, APIEndpoint, HTTPMethod, RequestField, ResponseField,
            FieldType, QueryParam,
        )
        from src.schemas.db_schema import (
            DatabaseSchema, DBTable, Column, ColumnType, ForeignKey, Index,
        )
        from src.schemas.auth_schema import (
            AuthSchema, AuthProvider, SessionConfig, RBACRule, RouteGuard,
        )

        # Return realistic mock data based on response model type
        if response_model == IntentModel:
            return IntentModel(
                app_name="SmartCRM",
                domain="CRM",
                description="A comprehensive CRM platform with contact management, role-based access control, analytics dashboard, and premium subscription plans.",
                features=[
                    Feature(name="Contact Management", description="Create, view, edit, and delete contacts with full details", category=FeatureCategory.CORE),
                    Feature(name="User Authentication", description="Secure login and registration with email/password", category=FeatureCategory.AUTH),
                    Feature(name="Dashboard", description="Overview dashboard with key metrics and charts", category=FeatureCategory.ANALYTICS),
                    Feature(name="Role-Based Access", description="Admin, Manager, and User roles with different permissions", category=FeatureCategory.AUTH),
                    Feature(name="Premium Plans", description="Subscription-based premium features with payment processing", category=FeatureCategory.PAYMENT),
                    Feature(name="Analytics", description="Detailed analytics and reporting for administrators", category=FeatureCategory.ANALYTICS),
                ],
                roles=["Admin", "Sales Manager", "User"],
                requires_authentication=True,
                requires_payments=True,
                requires_analytics=True,
                assumptions=["Email/password is the primary auth method", "Stripe is the payment processor"],
            )

        elif response_model == SystemArchitecture:
            return SystemArchitecture(
                app_name="SmartCRM",
                entities=[
                    Entity(name="User", description="Application user account", is_user_entity=True, fields=[
                        EntityField(name="id", field_type="uuid", required=True, unique=True),
                        EntityField(name="email", field_type="email", required=True, unique=True),
                        EntityField(name="password_hash", field_type="string", required=True),
                        EntityField(name="full_name", field_type="string", required=True),
                        EntityField(name="role", field_type="string", required=True),
                        EntityField(name="is_active", field_type="boolean", required=True),
                        EntityField(name="created_at", field_type="datetime", required=True),
                        EntityField(name="updated_at", field_type="datetime", required=True),
                    ]),
                    Entity(name="Contact", description="Customer contact record", fields=[
                        EntityField(name="id", field_type="uuid", required=True, unique=True),
                        EntityField(name="first_name", field_type="string", required=True),
                        EntityField(name="last_name", field_type="string", required=True),
                        EntityField(name="email", field_type="email", required=True),
                        EntityField(name="phone", field_type="string", required=False),
                        EntityField(name="company", field_type="string", required=False),
                        EntityField(name="status", field_type="string", required=True),
                        EntityField(name="owner_id", field_type="uuid", required=True),
                        EntityField(name="created_at", field_type="datetime", required=True),
                        EntityField(name="updated_at", field_type="datetime", required=True),
                    ]),
                    Entity(name="Subscription", description="User subscription plan", fields=[
                        EntityField(name="id", field_type="uuid", required=True, unique=True),
                        EntityField(name="user_id", field_type="uuid", required=True),
                        EntityField(name="plan", field_type="string", required=True),
                        EntityField(name="status", field_type="string", required=True),
                        EntityField(name="started_at", field_type="datetime", required=True),
                        EntityField(name="expires_at", field_type="datetime", required=False),
                        EntityField(name="created_at", field_type="datetime", required=True),
                        EntityField(name="updated_at", field_type="datetime", required=True),
                    ]),
                ],
                relationships=[
                    Relationship(from_entity="Contact", to_entity="User", relationship_type=RelationshipType.MANY_TO_MANY, description="Contact owned by user"),
                    Relationship(from_entity="Subscription", to_entity="User", relationship_type=RelationshipType.ONE_TO_ONE, description="User subscription"),
                ],
                user_flows=[
                    UserFlow(name="User Registration", actor="User", description="New user signs up", steps=[
                        UserFlowStep(step_number=1, action="Navigate to registration page", page="register", outcome="Registration form displayed"),
                        UserFlowStep(step_number=2, action="Fill in registration details", page="register", outcome="Form validated"),
                        UserFlowStep(step_number=3, action="Submit registration", page="register", outcome="Account created, redirected to dashboard"),
                    ]),
                ],
                roles=[
                    RoleDefinition(name="Admin", description="Full system access", permissions=["manage_users", "manage_contacts", "view_analytics", "manage_subscriptions"]),
                    RoleDefinition(name="Sales Manager", description="Manage contacts and view reports", permissions=["manage_contacts", "view_analytics"]),
                    RoleDefinition(name="User", description="Basic contact access", permissions=["view_contacts", "create_contacts", "edit_own_contacts"], is_default=True),
                ],
                permissions=[
                    Permission(name="manage_users", description="Full user management", resource="User", actions=["create", "read", "update", "delete", "list"]),
                    Permission(name="manage_contacts", description="Full contact management", resource="Contact", actions=["create", "read", "update", "delete", "list", "export"]),
                    Permission(name="view_contacts", description="View contacts", resource="Contact", actions=["read", "list"]),
                    Permission(name="create_contacts", description="Create new contacts", resource="Contact", actions=["create"]),
                    Permission(name="edit_own_contacts", description="Edit own contacts only", resource="Contact", actions=["update"]),
                    Permission(name="view_analytics", description="View analytics dashboard", resource="Analytics", actions=["read"]),
                    Permission(name="manage_subscriptions", description="Manage subscription plans", resource="Subscription", actions=["create", "read", "update", "delete", "list"]),
                ],
                business_rules=[
                    BusinessRule(name="auto_assign_owner", description="Auto-assign contact owner on creation", entity="Contact", condition="on_create", action="Set owner_id to current user"),
                ],
            )

        elif response_model == UISchema:
            return UISchema(
                app_name="SmartCRM",
                theme="dark",
                pages=[
                    Page(name="dashboard", title="Dashboard", route="/", layout="dashboard",
                         components=[
                             PageComponent(component_type=ComponentType.STATS_GRID, component_id="dashboard-stats",
                                           stat_cards=[
                                               StatCard(title="Total Contacts", value_endpoint="/api/v1/stats/contacts", icon="users", color="blue"),
                                               StatCard(title="Active Users", value_endpoint="/api/v1/stats/users", icon="user-check", color="green"),
                                               StatCard(title="Revenue", value_endpoint="/api/v1/stats/revenue", icon="dollar-sign", color="violet"),
                                               StatCard(title="Conversion Rate", value_endpoint="/api/v1/stats/conversion", icon="trending-up", color="amber"),
                                           ], grid_column_span=12),
                             PageComponent(component_type=ComponentType.CHART, component_id="contacts-chart",
                                           chart=ChartConfig(chart_type="area", title="Contacts Over Time", data_endpoint="/api/v1/analytics/contacts-trend", x_axis="date", y_axis="count"),
                                           grid_column_span=8),
                             PageComponent(component_type=ComponentType.CHART, component_id="status-chart",
                                           chart=ChartConfig(chart_type="pie", title="Contact Status", data_endpoint="/api/v1/analytics/contact-status", x_axis="status", y_axis="count"),
                                           grid_column_span=4),
                         ], allowed_roles=["Admin", "Sales Manager"]),
                    Page(name="contacts", title="Contacts", route="/contacts", layout="dashboard",
                         components=[
                             PageComponent(component_type=ComponentType.TABLE, component_id="contacts-table",
                                           table=Table(name="contacts-table", title="All Contacts", data_endpoint="/api/v1/contacts",
                                                       columns=[
                                                           TableColumn(key="first_name", label="First Name"),
                                                           TableColumn(key="last_name", label="Last Name"),
                                                           TableColumn(key="email", label="Email"),
                                                           TableColumn(key="company", label="Company"),
                                                           TableColumn(key="status", label="Status", data_type="badge"),
                                                           TableColumn(key="created_at", label="Created", data_type="date"),
                                                       ], row_actions=["view", "edit", "delete"]),
                                           grid_column_span=12),
                         ],
                         buttons=[Button(label="Add Contact", action="navigate", target="/contacts/new", variant="primary")]),
                    Page(name="contact-form", title="New Contact", route="/contacts/new", layout="dashboard",
                         components=[
                             PageComponent(component_type=ComponentType.FORM, component_id="contact-form",
                                           form=Form(name="contact-form", title="Create Contact", submit_endpoint="/api/v1/contacts", submit_method="POST",
                                                     fields=[
                                                         FormField(name="first_name", label="First Name", input_type=InputType.TEXT, required=True),
                                                         FormField(name="last_name", label="Last Name", input_type=InputType.TEXT, required=True),
                                                         FormField(name="email", label="Email", input_type=InputType.EMAIL, required=True),
                                                         FormField(name="phone", label="Phone", input_type=InputType.PHONE, required=False),
                                                         FormField(name="company", label="Company", input_type=InputType.TEXT, required=False),
                                                         FormField(name="status", label="Status", input_type=InputType.SELECT, options=["New", "Active", "Inactive"]),
                                                     ]),
                                           grid_column_span=8),
                         ]),
                    Page(name="login", title="Login", route="/login", layout="auth", requires_auth=False,
                         components=[
                             PageComponent(component_type=ComponentType.FORM, component_id="login-form",
                                           form=Form(name="login-form", title="Sign In", submit_endpoint="/api/v1/auth/login", submit_method="POST",
                                                     fields=[
                                                         FormField(name="email", label="Email", input_type=InputType.EMAIL, required=True),
                                                         FormField(name="password", label="Password", input_type=InputType.PASSWORD, required=True),
                                                     ]),
                                           grid_column_span=6),
                         ]),
                ],
                navigation=[
                    NavigationItem(label="Dashboard", route="/", icon="layout-dashboard"),
                    NavigationItem(label="Contacts", route="/contacts", icon="users"),
                    NavigationItem(label="Analytics", route="/analytics", icon="bar-chart-3", requires_role="Admin"),
                    NavigationItem(label="Settings", route="/settings", icon="settings"),
                ],
            )

        elif response_model == APISchema:
            return APISchema(
                base_path="/api",
                version="v1",
                endpoints=[
                    APIEndpoint(path="/api/v1/auth/login", method=HTTPMethod.POST, summary="User login", tag="Auth", auth_required=False,
                                request_fields=[RequestField(name="email", field_type=FieldType.EMAIL), RequestField(name="password", field_type=FieldType.STRING)],
                                response_fields=[ResponseField(name="access_token", field_type=FieldType.STRING), ResponseField(name="refresh_token", field_type=FieldType.STRING), ResponseField(name="user", field_type=FieldType.OBJECT)],
                                response_status=200),
                    APIEndpoint(path="/api/v1/auth/register", method=HTTPMethod.POST, summary="User registration", tag="Auth", auth_required=False,
                                request_fields=[RequestField(name="email", field_type=FieldType.EMAIL), RequestField(name="password", field_type=FieldType.STRING), RequestField(name="full_name", field_type=FieldType.STRING)],
                                response_fields=[ResponseField(name="id", field_type=FieldType.UUID), ResponseField(name="email", field_type=FieldType.EMAIL)],
                                response_status=201),
                    APIEndpoint(path="/api/v1/contacts", method=HTTPMethod.GET, summary="List contacts", tag="Contacts",
                                query_params=[QueryParam(name="page", param_type=FieldType.INTEGER, default_value="1"), QueryParam(name="limit", param_type=FieldType.INTEGER, default_value="20"), QueryParam(name="search", param_type=FieldType.STRING)],
                                response_fields=[ResponseField(name="items", field_type=FieldType.ARRAY), ResponseField(name="total", field_type=FieldType.INTEGER), ResponseField(name="page", field_type=FieldType.INTEGER)]),
                    APIEndpoint(path="/api/v1/contacts", method=HTTPMethod.POST, summary="Create contact", tag="Contacts",
                                request_fields=[RequestField(name="first_name", field_type=FieldType.STRING), RequestField(name="last_name", field_type=FieldType.STRING), RequestField(name="email", field_type=FieldType.EMAIL), RequestField(name="phone", field_type=FieldType.STRING, required=False), RequestField(name="company", field_type=FieldType.STRING, required=False)],
                                response_fields=[ResponseField(name="id", field_type=FieldType.UUID), ResponseField(name="first_name", field_type=FieldType.STRING), ResponseField(name="last_name", field_type=FieldType.STRING)],
                                response_status=201),
                    APIEndpoint(path="/api/v1/contacts/{id}", method=HTTPMethod.GET, summary="Get contact", tag="Contacts",
                                response_fields=[ResponseField(name="id", field_type=FieldType.UUID), ResponseField(name="first_name", field_type=FieldType.STRING), ResponseField(name="last_name", field_type=FieldType.STRING), ResponseField(name="email", field_type=FieldType.EMAIL)]),
                    APIEndpoint(path="/api/v1/contacts/{id}", method=HTTPMethod.PUT, summary="Update contact", tag="Contacts",
                                request_fields=[RequestField(name="first_name", field_type=FieldType.STRING, required=False), RequestField(name="last_name", field_type=FieldType.STRING, required=False), RequestField(name="email", field_type=FieldType.EMAIL, required=False)],
                                response_fields=[ResponseField(name="id", field_type=FieldType.UUID), ResponseField(name="first_name", field_type=FieldType.STRING)]),
                    APIEndpoint(path="/api/v1/contacts/{id}", method=HTTPMethod.DELETE, summary="Delete contact", tag="Contacts",
                                allowed_roles=["Admin", "Sales Manager"], response_status=204),
                    APIEndpoint(path="/api/v1/stats/contacts", method=HTTPMethod.GET, summary="Contact statistics", tag="Analytics",
                                allowed_roles=["Admin", "Sales Manager"],
                                response_fields=[ResponseField(name="total", field_type=FieldType.INTEGER), ResponseField(name="active", field_type=FieldType.INTEGER)]),
                ],
            )

        elif response_model == DatabaseSchema:
            return DatabaseSchema(
                database_name="smartcrm",
                tables=[
                    DBTable(name="users", description="Application users", columns=[
                        Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False, default_value="gen_random_uuid()"),
                        Column(name="email", column_type=ColumnType.VARCHAR, nullable=False, unique=True, max_length=255),
                        Column(name="password_hash", column_type=ColumnType.VARCHAR, nullable=False, max_length=255),
                        Column(name="full_name", column_type=ColumnType.VARCHAR, nullable=False, max_length=255),
                        Column(name="role", column_type=ColumnType.VARCHAR, nullable=False, max_length=50),
                        Column(name="is_active", column_type=ColumnType.BOOLEAN, nullable=False, default_value="true"),
                        Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                        Column(name="updated_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                    ], indexes=[
                        Index(name="idx_users_email", columns=["email"], unique=True),
                    ]),
                    DBTable(name="contacts", description="Customer contacts", columns=[
                        Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False, default_value="gen_random_uuid()"),
                        Column(name="first_name", column_type=ColumnType.VARCHAR, nullable=False, max_length=100),
                        Column(name="last_name", column_type=ColumnType.VARCHAR, nullable=False, max_length=100),
                        Column(name="email", column_type=ColumnType.VARCHAR, nullable=False, max_length=255),
                        Column(name="phone", column_type=ColumnType.VARCHAR, nullable=True, max_length=20),
                        Column(name="company", column_type=ColumnType.VARCHAR, nullable=True, max_length=255),
                        Column(name="status", column_type=ColumnType.VARCHAR, nullable=False, max_length=20, default_value="'new'"),
                        Column(name="owner_id", column_type=ColumnType.UUID, nullable=False),
                        Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                        Column(name="updated_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                    ], foreign_keys=[
                        ForeignKey(column="owner_id", references_table="users", references_column="id", on_delete="CASCADE"),
                    ], indexes=[
                        Index(name="idx_contacts_owner", columns=["owner_id"]),
                        Index(name="idx_contacts_email", columns=["email"]),
                        Index(name="idx_contacts_status", columns=["status"]),
                    ]),
                    DBTable(name="subscriptions", description="User subscriptions", columns=[
                        Column(name="id", column_type=ColumnType.UUID, primary_key=True, nullable=False, default_value="gen_random_uuid()"),
                        Column(name="user_id", column_type=ColumnType.UUID, nullable=False, unique=True),
                        Column(name="plan", column_type=ColumnType.VARCHAR, nullable=False, max_length=50),
                        Column(name="status", column_type=ColumnType.VARCHAR, nullable=False, max_length=20),
                        Column(name="started_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                        Column(name="expires_at", column_type=ColumnType.TIMESTAMP, nullable=True),
                        Column(name="created_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                        Column(name="updated_at", column_type=ColumnType.TIMESTAMP, nullable=False, default_value="NOW()"),
                    ], foreign_keys=[
                        ForeignKey(column="user_id", references_table="users", references_column="id", on_delete="CASCADE"),
                    ], indexes=[
                        Index(name="idx_subscriptions_user", columns=["user_id"], unique=True),
                    ]),
                ],
            )

        elif response_model == AuthSchema:
            return AuthSchema(
                auth_providers=[
                    AuthProvider(provider_type="email_password", enabled=True),
                ],
                session_config=SessionConfig(),
                rbac_rules=[
                    RBACRule(role="Admin", resource="User", actions=["create", "read", "update", "delete", "list"]),
                    RBACRule(role="Admin", resource="Contact", actions=["create", "read", "update", "delete", "list", "export"]),
                    RBACRule(role="Admin", resource="Analytics", actions=["read"]),
                    RBACRule(role="Admin", resource="Subscription", actions=["create", "read", "update", "delete", "list"]),
                    RBACRule(role="Sales Manager", resource="Contact", actions=["create", "read", "update", "delete", "list", "export"]),
                    RBACRule(role="Sales Manager", resource="Analytics", actions=["read"]),
                    RBACRule(role="User", resource="Contact", actions=["read", "list", "create"], conditions=["own_only"]),
                ],
                route_guards=[
                    RouteGuard(route="/", allowed_roles=["Admin", "Sales Manager", "User"]),
                    RouteGuard(route="/contacts", allowed_roles=["Admin", "Sales Manager", "User"]),
                    RouteGuard(route="/analytics", allowed_roles=["Admin"]),
                    RouteGuard(route="/settings", allowed_roles=["Admin"]),
                    RouteGuard(route="/login", allowed_roles=[], requires_auth=False),
                ],
            )

        # Fallback: try to construct with minimal required fields
        try:
            return response_model.model_construct()
        except Exception:
            raise RuntimeError(
                f"No mock data available for {response_model.__name__}. "
                "Please provide an OpenAI API key."
            )


# Singleton
llm_service = LLMService()
