"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Global application settings loaded from environment variables."""

    # OpenAI Configuration
    openai_api_key: str = Field(default="", description="OpenAI API key")
    openai_model: str = Field(default="gpt-4o", description="OpenAI model to use")
    temperature: float = Field(default=0.0, description="LLM temperature for deterministic output")
    max_retries: int = Field(default=3, description="Max retries for LLM calls")

    # Database
    database_url: str = Field(
        default="postgresql://compiler:compiler@localhost:5432/ai_compiler",
        description="PostgreSQL connection string",
    )

    # Server
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        description="Allowed CORS origins",
    )

    # Pipeline
    max_repair_iterations: int = Field(default=3, description="Max repair loop iterations")
    schema_generation_parallel: bool = Field(
        default=True, description="Parallelize schema generation calls"
    )

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


# Singleton instance
settings = Settings()
