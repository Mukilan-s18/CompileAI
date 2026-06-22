"""Runtime configuration models.

Part of Stage 3 output: Configuration needed to actually deploy and run
the generated application.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class DatabaseConfig(BaseModel):
    """Database runtime configuration."""
    engine: str = Field(default="postgresql", description="Database engine")
    host: str = Field(default="localhost", description="Database host")
    port: int = Field(default=5432, description="Database port")
    name: str = Field(..., description="Database name")
    pool_size: int = Field(default=10, description="Connection pool size")
    ssl_required: bool = Field(default=False, description="Require SSL connections")


class CacheConfig(BaseModel):
    """Caching configuration."""
    enabled: bool = Field(default=True, description="Whether caching is enabled")
    provider: str = Field(default="redis", description="Cache provider: redis, memcached, memory")
    ttl_seconds: int = Field(default=300, description="Default cache TTL")


class StorageConfig(BaseModel):
    """File storage configuration."""
    provider: str = Field(
        default="local", description="Storage provider: local, s3, gcs"
    )
    max_file_size_mb: int = Field(default=10, description="Max upload file size in MB")
    allowed_types: list[str] = Field(
        default_factory=lambda: ["image/jpeg", "image/png", "application/pdf"],
        description="Allowed MIME types",
    )


class EmailConfig(BaseModel):
    """Email service configuration."""
    provider: str = Field(
        default="smtp", description="Email provider: smtp, sendgrid, ses"
    )
    from_address: str = Field(
        default="noreply@app.com", description="Default from address"
    )
    templates_enabled: bool = Field(default=True, description="Use email templates")


class FeatureFlag(BaseModel):
    """A feature flag for toggling functionality."""
    name: str = Field(..., description="Feature flag name")
    enabled: bool = Field(default=True, description="Whether feature is enabled")
    description: str = Field(default="", description="Flag description")


class ServerConfig(BaseModel):
    """Server runtime configuration."""
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    workers: int = Field(default=4, description="Number of worker processes")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["*"], description="Allowed CORS origins"
    )
    rate_limit: str = Field(
        default="1000/hour", description="Global rate limit"
    )


class RuntimeConfig(BaseModel):
    """Complete runtime configuration for the application.

    Part of Stage 3 output.
    """
    app_name: str = Field(..., description="Application name")
    environment: str = Field(
        default="production", description="Environment: development, staging, production"
    )
    server: ServerConfig = Field(
        default_factory=ServerConfig, description="Server configuration"
    )
    database: DatabaseConfig = Field(..., description="Database configuration")
    cache: CacheConfig = Field(
        default_factory=CacheConfig, description="Cache configuration"
    )
    storage: StorageConfig = Field(
        default_factory=StorageConfig, description="File storage configuration"
    )
    email: EmailConfig = Field(
        default_factory=EmailConfig, description="Email configuration"
    )
    feature_flags: list[FeatureFlag] = Field(
        default_factory=list, description="Feature flags"
    )
    logging_level: str = Field(default="INFO", description="Logging level")
