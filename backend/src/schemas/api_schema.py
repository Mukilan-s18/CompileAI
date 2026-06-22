"""API schema models.

Stage 3 output (part 2): Complete API specification including endpoints,
request/response models, validation rules, and middleware config.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class HTTPMethod(str, Enum):
    """Supported HTTP methods."""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


class FieldType(str, Enum):
    """API field data types."""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATETIME = "datetime"
    UUID = "uuid"
    EMAIL = "email"
    URL = "url"
    ARRAY = "array"
    OBJECT = "object"
    DECIMAL = "decimal"


class RequestField(BaseModel):
    """A field in a request body."""
    name: str = Field(..., description="Field name in snake_case")
    field_type: FieldType = Field(..., description="Data type")
    required: bool = Field(default=True, description="Whether field is required")
    description: str = Field(default="", description="Field description")
    validation: list[str] = Field(
        default_factory=list,
        description="Validation rules: min_length:N, max_length:N, pattern:REGEX, min:N, max:N",
    )
    default_value: str | None = Field(default=None, description="Default value")


class ResponseField(BaseModel):
    """A field in a response body."""
    name: str = Field(..., description="Field name in snake_case")
    field_type: FieldType = Field(..., description="Data type")
    description: str = Field(default="", description="Field description")
    nullable: bool = Field(default=False, description="Whether field can be null")


class QueryParam(BaseModel):
    """A query parameter for GET endpoints."""
    name: str = Field(..., description="Parameter name")
    param_type: FieldType = Field(default=FieldType.STRING, description="Parameter type")
    required: bool = Field(default=False, description="Whether parameter is required")
    description: str = Field(default="", description="Parameter description")
    default_value: str | None = Field(default=None, description="Default value")


class APIEndpoint(BaseModel):
    """A single API endpoint specification."""
    path: str = Field(..., description="URL path, e.g. '/api/contacts'")
    method: HTTPMethod = Field(..., description="HTTP method")
    summary: str = Field(..., description="Endpoint description")
    tag: str = Field(..., description="API grouping tag, e.g. 'Contacts'")
    request_fields: list[RequestField] = Field(
        default_factory=list, description="Request body fields"
    )
    response_fields: list[ResponseField] = Field(
        default_factory=list, description="Response body fields"
    )
    query_params: list[QueryParam] = Field(
        default_factory=list, description="Query parameters for GET endpoints"
    )
    auth_required: bool = Field(default=True, description="Whether endpoint requires auth")
    allowed_roles: list[str] = Field(
        default_factory=list,
        description="Roles allowed to call this endpoint (empty = all authenticated)",
    )
    rate_limit: str | None = Field(
        default=None, description="Rate limit, e.g. '100/minute'"
    )
    response_status: int = Field(default=200, description="Success HTTP status code")


class APIMiddleware(BaseModel):
    """Middleware configuration for the API."""
    name: str = Field(..., description="Middleware name")
    config: dict[str, str] = Field(
        default_factory=dict, description="Middleware configuration"
    )


class APISchema(BaseModel):
    """Complete API specification for the application.

    Stage 3 output (API portion).
    """
    base_path: str = Field(default="/api", description="API base path prefix")
    version: str = Field(default="v1", description="API version")
    endpoints: list[APIEndpoint] = Field(
        ..., min_length=1, description="All API endpoints"
    )
    middleware: list[APIMiddleware] = Field(
        default_factory=list, description="API middleware stack"
    )
    global_headers: dict[str, str] = Field(
        default_factory=dict, description="Headers applied to all responses"
    )
