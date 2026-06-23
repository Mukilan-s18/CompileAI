from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# ==========================================
# 1. Intent Extraction Schemas
# ==========================================
class Assumption(BaseModel):
    category: str = Field(..., description="e.g., 'Authentication', 'Database', 'Business Logic'")
    assumption_made: str = Field(..., description="The exact assumption made (e.g., 'Assumed Email/Password auth')")
    reasoning: str = Field(..., description="Why this assumption was necessary")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")

class ExtractedIntent(BaseModel):
    primary_goal: str = Field(..., description="The main objective of the application")
    core_entities: List[str] = Field(..., description="List of main data entities (e.g., 'User', 'Product')")
    user_roles: List[str] = Field(..., description="List of user roles (e.g., 'Admin', 'Customer')")
    features: List[str] = Field(..., description="List of required features extracted from prompt")
    assumptions: List[Assumption] = Field(..., description="List of assumptions made to handle ambiguity")

# ==========================================
# 2. System Design / Architecture Schemas
# ==========================================
class SystemArchitecture(BaseModel):
    frontend_framework: str = Field(..., description="e.g., 'React', 'Next.js'")
    backend_framework: str = Field(..., description="e.g., 'Express', 'FastAPI'")
    database_type: str = Field(..., description="e.g., 'PostgreSQL', 'SQLite'")
    auth_provider: str = Field(..., description="e.g., 'JWT', 'Firebase'")
    architecture_pattern: str = Field(..., description="e.g., 'Monolith', 'Microservices'")
    key_design_decisions: List[str] = Field(..., description="Major architectural decisions made")

# ==========================================
# 3. Component Schemas (UI, API, DB, Auth)
# ==========================================
class UIComponent(BaseModel):
    name: str
    type: str = Field(..., description="e.g., 'Page', 'Modal', 'Form'")
    consumes_endpoints: List[str] = Field(default_factory=list, description="API routes this component calls")
    description: str

class APIEndpoint(BaseModel):
    path: str = Field(..., description="e.g., '/api/users'")
    method: str = Field(..., description="GET, POST, PUT, DELETE")
    interacts_with_tables: List[str] = Field(default_factory=list, description="DB tables accessed")
    requires_auth: bool
    allowed_roles: List[str] = Field(default_factory=list)

class DBColumn(BaseModel):
    name: str
    type: str = Field(..., description="e.g., 'VARCHAR', 'INTEGER', 'BOOLEAN'")
    is_primary: bool = False
    is_foreign_key: bool = False
    references_table: Optional[str] = None
    is_nullable: bool = False

class DBTable(BaseModel):
    name: str
    columns: List[DBColumn]

class AuthRule(BaseModel):
    role: str
    resource: str = Field(..., description="The table or endpoint being accessed")
    actions: List[str] = Field(..., description="e.g., ['CREATE', 'READ', 'UPDATE', 'DELETE']")
    conditions: Optional[str] = Field(None, description="e.g., 'owner_id == user.id'")

# ==========================================
# 4. Global Application Schema
# ==========================================
class ApplicationSchema(BaseModel):
    ui_schema: List[UIComponent]
    api_schema: List[APIEndpoint]
    db_schema: List[DBTable]
    auth_rules: List[AuthRule]

# ==========================================
# 5. Validation & Execution Schemas
# ==========================================
class ValidationError(BaseModel):
    layer: str = Field(..., description="e.g., 'DB', 'API', 'UI', 'Cross-Layer'")
    issue: str = Field(..., description="Description of the error")
    severity: str = Field(..., description="'High', 'Medium', 'Low'")

class ValidationReport(BaseModel):
    is_valid: bool
    errors: List[ValidationError]
    consistency_score: float = Field(..., description="Percentage 0.0 to 100.0")

class ExecutionReport(BaseModel):
    is_executable: bool
    compilation_errors: List[str] = Field(default_factory=list)
    deployment_readiness_score: float
