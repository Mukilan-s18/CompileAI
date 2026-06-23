from src.schemas.compiler import ExtractedIntent, SystemArchitecture
from src.services.llm import generate_structured_output

def design_architecture(intent: ExtractedIntent) -> SystemArchitecture:
    """
    Takes the structured intent and decides the high-level system architecture.
    """
    messages = [
        {"role": "system", "content": "You are the System Design Layer of an AI Compiler. Given the user's extracted intent and documented assumptions, output a strict technical architecture including frameworks, database type, auth provider, and key design decisions."},
        {"role": "user", "content": f"Here is the Extracted Intent:\n{intent.model_dump_json(indent=2)}\n\nGenerate the System Architecture."}
    ]
    
    arch = generate_structured_output(SystemArchitecture, messages)
    return arch
