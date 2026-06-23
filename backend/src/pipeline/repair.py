from src.schemas.compiler import ApplicationSchema, ValidationReport
from src.services.llm import generate_structured_output

def repair_schema(app_schema: ApplicationSchema, validation_report: ValidationReport) -> ApplicationSchema:
    """
    Feeds the validation errors back to the LLM and requests a targeted repair 
    of the existing ApplicationSchema.
    """
    error_descriptions = "\n".join([f"- [{err.layer}] {err.severity} severity: {err.issue}" for err in validation_report.errors])
    
    messages = [
        {"role": "system", "content": "You are the Repair Engine of an AI Compiler. You have been given an ApplicationSchema that failed programmatic validation. Your job is to strictly repair the requested schema based on the provided errors. DO NOT regenerate the entire schema from scratch or change components that are unrelated to the errors. Return the fully repaired ApplicationSchema."},
        {"role": "user", "content": f"Here are the validation errors you must fix:\n{error_descriptions}\n\nHere is the broken ApplicationSchema:\n{app_schema.model_dump_json(indent=2)}\n\nGenerate the Repaired ApplicationSchema."}
    ]
    
    repaired_schema = generate_structured_output(ApplicationSchema, messages)
    return repaired_schema
