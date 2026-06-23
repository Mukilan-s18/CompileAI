export interface Assumption {
  category: string;
  assumption_made: string;
  reasoning: string;
  confidence: number;
}

export interface ExtractedIntent {
  primary_goal: string;
  core_entities: string[];
  user_roles: string[];
  features: string[];
  assumptions: Assumption[];
}

export interface SystemArchitecture {
  frontend_framework: string;
  backend_framework: string;
  database_type: string;
  auth_provider: string;
  architecture_pattern: string;
  key_design_decisions: string[];
}

export interface UIComponent {
  name: string;
  type: string;
  consumes_endpoints: string[];
  description: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  interacts_with_tables: string[];
  requires_auth: boolean;
  allowed_roles: string[];
}

export interface DBColumn {
  name: string;
  type: string;
  is_primary: boolean;
  is_foreign_key: boolean;
  references_table: string | null;
  is_nullable: boolean;
}

export interface DBTable {
  name: string;
  columns: DBColumn[];
}

export interface AuthRule {
  role: string;
  resource: string;
  actions: string[];
  conditions: string | null;
}

export interface ApplicationSchema {
  ui_schema: UIComponent[];
  api_schema: APIEndpoint[];
  db_schema: DBTable[];
  auth_rules: AuthRule[];
}

export interface ValidationError {
  layer: string;
  issue: string;
  severity: string;
}

export interface ValidationReport {
  is_valid: boolean;
  errors: ValidationError[];
  consistency_score: number;
}

export interface ExecutionReport {
  is_executable: boolean;
  compilation_errors: string[];
  deployment_readiness_score: number;
}

export interface CompilerOutputs {
  intent: ExtractedIntent;
  architecture: SystemArchitecture;
  application_schema: ApplicationSchema;
  validation: ValidationReport;
  execution: ExecutionReport;
}

export interface CompilerResponse {
  session_id: string;
  status: string;
  telemetry: Record<string, unknown>;
  repair_count: number;
  outputs: CompilerOutputs;
}
