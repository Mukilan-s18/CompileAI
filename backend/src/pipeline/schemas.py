from src.schemas.compiler import ExtractedIntent, SystemArchitecture, ApplicationSchema
from src.services.llm import generate_structured_output

def generate_schemas(intent: ExtractedIntent, arch: SystemArchitecture) -> ApplicationSchema:
    """
    Generates the strict UI, API, DB, and Auth schemas based on the intent and architecture.
    """
    messages = [
        {"role": "system", "content": "You are the Schema Generation Layer of an AI Compiler. You must convert the Intent and Architecture into a complete ApplicationSchema. You MUST ensure cross-layer consistency: every API endpoint should map to a DB table, and every UI component should use valid API endpoints."},
        {"role": "user", "content": f"Intent:\n{intent.model_dump_json(indent=2)}\n\nArchitecture:\n{arch.model_dump_json(indent=2)}\n\nGenerate the complete ApplicationSchema."}
    ]
    
    app_schema = generate_structured_output(ApplicationSchema, messages)
    return app_schema
