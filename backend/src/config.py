from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    # Add other provider keys if necessary
    
    # We allow the .env file to be missing in production environments
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
