import instructor
from openai import OpenAI
from src.config import settings

def get_llm_client():
    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-your"):
        return None
    return instructor.patch(OpenAI(api_key=settings.OPENAI_API_KEY))

def generate_structured_output(response_model, messages, model="gpt-4o"):
    client = get_llm_client()
    if not client:
        print(f"WARN: Mocking LLM response for {response_model.__name__} because OPENAI_API_KEY is not set.")
        return get_mock_response(response_model)
        
    return client.chat.completions.create(
        model=model,
        response_model=response_model,
        messages=messages,
    )

def get_mock_response(response_model):
    """Provides a dummy structured response matching the requested schema for testing."""
    from src.schemas.compiler import ExtractedIntent, SystemArchitecture, ApplicationSchema, Assumption
    
    if response_model == ExtractedIntent:
        return ExtractedIntent(
            primary_goal="Mock Goal",
            core_entities=["User", "Item"],
            user_roles=["Admin", "Customer"],
            features=["Login", "Dashboard"],
            assumptions=[Assumption(category="Auth", assumption_made="Email/Password", reasoning="Standard", confidence=0.9)]
        )
    elif response_model == SystemArchitecture:
        return SystemArchitecture(
            frontend_framework="React",
            backend_framework="Express",
            database_type="SQLite",
            auth_provider="JWT",
            architecture_pattern="Monolith",
            key_design_decisions=["Use SQLite for simplicity"]
        )
    elif response_model == ApplicationSchema:
        return ApplicationSchema(
            ui_schema=[],
            api_schema=[],
            db_schema=[],
            auth_rules=[]
        )
    
    # Generic fallback (should not be reached if all types are handled)
    return response_model()
