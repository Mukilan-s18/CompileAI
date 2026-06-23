import json
import uuid
import os
from src.pipeline.intent import extract_intent
from src.pipeline.architecture import design_architecture
from src.pipeline.schemas import generate_schemas
from src.pipeline.validation import validate_schema
from src.pipeline.repair import repair_schema
from src.pipeline.runtime import verify_execution
from src.services.telemetry import TelemetryLogger

REAL_PRODUCTS = [
    "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
    "HRMS platform with employee directory, leave management, payroll processing, and multi-tenant isolation.",
    "Inventory management system with barcode scanning APIs, low stock alerts, suppliers, and purchase orders.",
    "Learning management system with courses, video modules, student progress tracking, quizzes, and certificates.",
    "E-commerce storefront with product catalog, shopping cart, checkout via Stripe, and user order history.",
    "Hotel booking system with room availability calendars, dynamic pricing, reservations, and customer reviews.",
    "Help desk ticketing system with SLAs, agent assignments, priority queues, and customer email integration.",
    "SaaS analytics platform tracking custom events, funnel analysis, daily active users, and data export.",
    "Subscription meal kit delivery app with weekly menus, dietary preferences, delivery tracking, and payments.",
    "Project management tool with Kanban boards, task assignment, due dates, file attachments, and team chat."
]

EDGE_CASES = [
    "Make an app.", # Vague
    "I need a forum but without any database.", # Conflicting
    "Build a healthcare portal.", # Incomplete (Missing roles)
    "App for users to book flights.", # Incomplete (Missing auth)
    "Create a banking app where users can't login but can see their balance.", # Conflicting
    "A messaging app using SQLite, MongoDB, and PostgreSQL for the same table.", # Conflicting Architecture
    "Social network where every post belongs to a user but users don't exist.", # Cyclic/Missing Dependencies
    "Just give me an API to create users.", # Underspecified
    "An AI compiler that writes compilers.", # Abstract
    "Dashboard with nothing on it." # Vague/Minimal
]

def run_benchmark(prompt: str, category: str):
    session_id = str(uuid.uuid4())
    logger = TelemetryLogger(session_id)
    
    print(f"Running Benchmark [{category}]: {prompt[:50]}...")
    
    try:
        # Intent
        logger.start_stage("intent_extraction")
        intent = extract_intent(prompt)
        logger.end_stage("intent_extraction")
        
        # Architecture
        logger.start_stage("system_design")
        architecture = design_architecture(intent)
        logger.end_stage("system_design")
        
        # Schemas
        logger.start_stage("schema_generation")
        app_schema = generate_schemas(intent, architecture)
        logger.end_stage("schema_generation")
        
        # Validation
        logger.start_stage("validation")
        validation_report = validate_schema(app_schema)
        logger.end_stage("validation")
        
        # Repair Loop
        repair_count = 0
        max_repairs = 3
        while not validation_report.is_valid and repair_count < max_repairs:
            repair_count += 1
            logger.start_stage(f"repair_loop_{repair_count}")
            app_schema = repair_schema(app_schema, validation_report)
            validation_report = validate_schema(app_schema)
            logger.end_stage(f"repair_loop_{repair_count}")
            
        # Runtime
        logger.start_stage("runtime_verification")
        execution_report = verify_execution(app_schema)
        logger.end_stage("runtime_verification")
        
        return {
            "prompt": prompt,
            "category": category,
            "status": "PASS" if validation_report.is_valid and execution_report.is_executable else "FAIL",
            "repair_count": repair_count,
            "latency_ms": logger.telemetry.total_duration_ms,
            "validation_score": validation_report.consistency_score,
            "execution_ready": execution_report.is_executable,
            "error_msg": None
        }
        
    except Exception as e:
        return {
            "prompt": prompt,
            "category": category,
            "status": "ERROR",
            "repair_count": 0,
            "latency_ms": 0,
            "validation_score": 0,
            "execution_ready": False,
            "error_msg": str(e)
        }

if __name__ == "__main__":
    results = []
    
    for prompt in REAL_PRODUCTS:
        res = run_benchmark(prompt, "Real Product")
        results.append(res)
        
    for prompt in EDGE_CASES:
        res = run_benchmark(prompt, "Edge Case")
        results.append(res)
        
    # Persist results
    os.makedirs("/tmp/compileai_benchmarks", exist_ok=True)
    with open("/tmp/compileai_benchmarks/results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("Benchmarks Complete. Saved to /tmp/compileai_benchmarks/results.json")
