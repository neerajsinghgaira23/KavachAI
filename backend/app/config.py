from typing import List, Union
import json
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    APP_NAME: str = "KavachAI — Threat Inspector & Phishing Defense Engine"
    APP_ENV: str = "production"
    ENVIRONMENT: str = "production"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:80",
        "http://localhost",
        "*",
    ]
    
    # RDAP Configuration
    RDAP_BASE_URL: str = "https://rdap.org/domain/"
    RDAP_TIMEOUT_SECONDS: float = 3.5
    
    # Upload limits
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    DEFAULT_RULES_VERSION: str = "v1.4.2"
    
    # Scoring Weights Configuration
    WEIGHT_ADVANCE_FEE: float = 0.35
    WEIGHT_DOMAIN_AGE: float = 0.25
    WEIGHT_OFF_PLATFORM: float = 0.20
    WEIGHT_MAIL_REPUTATION: float = 0.20

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
