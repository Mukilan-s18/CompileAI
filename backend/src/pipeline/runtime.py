import os
import subprocess
import shutil
from src.schemas.compiler import ApplicationSchema, ExecutionReport

RUNTIME_DIR = "/tmp/compileai_runtime"

def generate_server_code(app_schema: ApplicationSchema) -> str:
    """Generates a basic Express.js server string representing the API routes."""
    code = "const express = require('express');\nconst app = express();\napp.use(express.json());\n\n"
    
    for api in app_schema.api_schema:
        # Convert path variables e.g., /api/users/{id} to /api/users/:id for Express
        express_path = api.path.replace('{', ':').replace('}', '')
        code += f"app.{api.method.lower()}('{express_path}', (req, res) => {{\n"
        code += f"  // Requires Auth: {api.requires_auth}\n"
        code += f"  // Allowed Roles: {api.allowed_roles}\n"
        code += f"  // Interacts with: {api.interacts_with_tables}\n"
        code += f"  res.json({{ status: 'success', route: '{api.path}' }});\n"
        code += f"}});\n\n"
        
    code += "module.exports = app;\n"
    return code

def verify_execution(app_schema: ApplicationSchema) -> ExecutionReport:
    """
    Scaffolds a Node.js project based on the generated schemas in a temporary directory,
    and runs a syntax check to verify execution readiness.
    """
    compilation_errors = []
    
    # 1. Clean and setup workspace
    if os.path.exists(RUNTIME_DIR):
        shutil.rmtree(RUNTIME_DIR)
    os.makedirs(RUNTIME_DIR)
    
    # 2. Generate server file
    server_code = generate_server_code(app_schema)
    server_file_path = os.path.join(RUNTIME_DIR, "server.js")
    
    with open(server_file_path, "w") as f:
        f.write(server_code)
        
    # 3. Run Node Syntax Check
    try:
        # 'node -c' checks the syntax without executing the application
        result = subprocess.run(
            ["node", "-c", "server.js"],
            cwd=RUNTIME_DIR,
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode != 0:
            compilation_errors.append(f"Node syntax check failed: {result.stderr}")
    except Exception as e:
        compilation_errors.append(f"Failed to execute syntax check: {str(e)}")
        
    is_executable = len(compilation_errors) == 0
    deployment_score = 100.0 if is_executable else 0.0

    return ExecutionReport(
        is_executable=is_executable,
        compilation_errors=compilation_errors,
        deployment_readiness_score=deployment_score
    )
