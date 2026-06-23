import uuid
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.pipeline.intent import extract_intent
from src.pipeline.architecture import design_architecture
from src.pipeline.schemas import generate_schemas
from src.pipeline.validation import validate_schema
from src.pipeline.repair import repair_schema
from src.pipeline.runtime import verify_execution
from src.services.telemetry import TelemetryLogger

app = FastAPI(title="CompileAI Core Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompileRequest(BaseModel):
    prompt: str

@app.post("/api/compile")
async def run_compiler_pipeline(request: CompileRequest):
    session_id = str(uuid.uuid4())
    logger = TelemetryLogger(session_id)
    
    try:
        # 1. Intent Extraction
        logger.start_stage("intent_extraction")
        intent = extract_intent(request.prompt)
        # Note: In a real production app we would extract token counts from the LLM response object.
        # Instructor strips the raw response by default, so we mock tokens for now.
        logger.end_stage("intent_extraction", prompt_tokens=150, completion_tokens=80)
        
        # 2. Architecture Design
        logger.start_stage("system_design")
        architecture = design_architecture(intent)
        logger.end_stage("system_design", prompt_tokens=250, completion_tokens=120)
        
        # 3. Schema Generation
        logger.start_stage("schema_generation")
        app_schema = generate_schemas(intent, architecture)
        logger.end_stage("schema_generation", prompt_tokens=500, completion_tokens=800)
        
        # 4. Validation Engine
        logger.start_stage("validation")
        validation_report = validate_schema(app_schema)
        logger.end_stage("validation")
        
        # 5. Targeted Repair Engine (Loop max 3 times)
        repair_count = 0
        max_repairs = 3
        while not validation_report.is_valid and repair_count < max_repairs:
            repair_count += 1
            logger.start_stage(f"repair_loop_{repair_count}")
            app_schema = repair_schema(app_schema, validation_report)
            validation_report = validate_schema(app_schema)
            logger.end_stage(f"repair_loop_{repair_count}", prompt_tokens=900, completion_tokens=300)
            
        # 6. Runtime Execution Awareness
        logger.start_stage("runtime_verification")
        execution_report = verify_execution(app_schema)
        logger.end_stage("runtime_verification")
        
        # Assemble Final Payload
        return {
            "session_id": session_id,
            "status": "success" if validation_report.is_valid and execution_report.is_executable else "failed",
            "telemetry": logger.get_report(),
            "repair_count": repair_count,
            "outputs": {
                "intent": json.loads(intent.model_dump_json()),
                "architecture": json.loads(architecture.model_dump_json()),
                "application_schema": json.loads(app_schema.model_dump_json()),
                "validation": json.loads(validation_report.model_dump_json()),
                "execution": json.loads(execution_report.model_dump_json())
            }
        }
        
    except Exception as e:
        logger.end_stage("failed_stage")
        raise HTTPException(status_code=500, detail=str(e))
