import instructor
from openai import OpenAI
from groq import Groq
from src.config import settings

def get_llm_client():
    if settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk-your"):
        client = Groq(api_key=settings.GROQ_API_KEY)
        return instructor.from_groq(client, mode=instructor.Mode.TOOLS), settings.GROQ_MODEL

    if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-your"):
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return instructor.from_openai(client), settings.OPENAI_MODEL

    return None, None

def generate_structured_output(response_model, messages, model=None):
    client, default_model = get_llm_client()
    if not client:
        print(f"WARN: Mocking LLM response for {response_model.__name__} because API keys are not set.")
        return get_mock_response(response_model)
        
    use_model = model or default_model
    return client.chat.completions.create(
        model=use_model,
        response_model=response_model,
        messages=messages,
        max_retries=5
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
