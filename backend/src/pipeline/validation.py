from src.schemas.compiler import ApplicationSchema, ValidationReport, ValidationError

def validate_schema(app_schema: ApplicationSchema) -> ValidationReport:
    """
    Programmatically verifies cross-layer consistency in the generated schema.
    Returns a ValidationReport detailing any issues.
    """
    errors = []
    
    # 1. DB Validity (Check foreign keys match existing tables)
    table_names = {t.name for t in app_schema.db_schema}
    for table in app_schema.db_schema:
        for col in table.columns:
            if col.is_foreign_key and col.references_table:
                if col.references_table not in table_names:
                    errors.append(ValidationError(
                        layer="DB",
                        issue=f"Table '{table.name}' has foreign key to non-existent table '{col.references_table}'",
                        severity="High"
                    ))
                    
    # 2. API <-> DB Consistency
    api_paths = {api.path for api in app_schema.api_schema}
    for api in app_schema.api_schema:
        for table_ref in api.interacts_with_tables:
            if table_ref not in table_names:
                errors.append(ValidationError(
                    layer="API <-> DB",
                    issue=f"API '{api.path}' interacts with non-existent table '{table_ref}'",
                    severity="High"
                ))
                
    # 3. UI <-> API Consistency
    for ui in app_schema.ui_schema:
        for endpoint in ui.consumes_endpoints:
            if endpoint not in api_paths:
                errors.append(ValidationError(
                    layer="UI <-> API",
                    issue=f"UI Component '{ui.name}' consumes non-existent endpoint '{endpoint}'",
                    severity="Medium"
                ))
                
    # 4. Auth <-> DB Consistency
    for rule in app_schema.auth_rules:
        if rule.resource not in table_names and rule.resource not in api_paths:
            errors.append(ValidationError(
                layer="Auth",
                issue=f"Auth rule for role '{rule.role}' references unknown resource '{rule.resource}'",
                severity="High"
            ))

    # Calculate mock consistency score based on error count
    total_checks = len(app_schema.db_schema) + len(app_schema.api_schema) + len(app_schema.ui_schema) + len(app_schema.auth_rules) + 1
    error_penalty = len(errors) * 10
    score = max(0.0, min(100.0, 100.0 - (error_penalty / total_checks * 100) if total_checks > 0 else 100.0))

    return ValidationReport(
        is_valid=len(errors) == 0,
        errors=errors,
        consistency_score=round(score, 2)
    )
