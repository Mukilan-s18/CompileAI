"""FastAPI application entry point.

Configures CORS, mounts routes, and sets up Prometheus metrics middleware.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Application Compiler",
    description=(
        "Converts natural language product requirements into "
        "validated, executable application specifications."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("=" * 60)
    logger.info("AI Application Compiler starting up")
    logger.info(f"  Model: {settings.openai_model}")
    logger.info(f"  Temperature: {settings.temperature}")
    logger.info(f"  Mock mode: {not settings.openai_api_key}")
    logger.info(f"  CORS origins: {settings.cors_origins}")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
