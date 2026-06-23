from src.schemas.compiler import ExtractedIntent
from src.services.llm import generate_structured_output

def extract_intent(prompt: str) -> ExtractedIntent:
    """
    Parses a raw natural language prompt into a structured ExtractedIntent object.
    It actively seeks out ambiguity and generates assumptions to fill gaps.
    """
    messages = [
        {"role": "system", "content": "You are the Intent Extraction layer of an AI Software Compiler. Your job is to parse the user's natural language request into a strict, structured configuration. You MUST detect ambiguity. If critical systems (like auth type, database type, or specific roles) are not explicitly stated, you must make reasonable engineering assumptions and document them explicitly in the 'assumptions' array."},
        {"role": "user", "content": f"Extract intent from this request: '{prompt}'"}
    ]
    
    intent = generate_structured_output(ExtractedIntent, messages)
    return intent
