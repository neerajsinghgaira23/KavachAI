from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.v1.endpoints import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    Handles startup logging, resource allocation, and graceful shutdown.
    """
    # Startup initialization
    print(f"[+] KavachAI Threat Inspector Engine Initialized (v{settings.DEFAULT_RULES_VERSION})")
    print(f"[+] RDAP Base: {settings.RDAP_BASE_URL} (Timeout: {settings.RDAP_TIMEOUT_SECONDS}s)")
    print(f"[+] CORS Allowed Origins: {settings.CORS_ORIGINS}")
    yield
    # Shutdown clean up
    print("[-] KavachAI Threat Inspector Engine Shutting Down Gracefully.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.DEFAULT_RULES_VERSION,
    description="KavachAI — Single-Page Threat Inspector & Phishing Defense Engine for Advance-Fee Fraud Detection.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health", tags=["Root"])
@app.get("/api/v1/health", tags=["Root"])
def root_health():
    """Direct root health check endpoint."""
    return {
        "status": "ONLINE",
        "engine": "KavachAI Threat Inspector",
        "rules_version": settings.DEFAULT_RULES_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
def root_index():
    return {
        "engine": "KavachAI Threat Inspector",
        "version": settings.DEFAULT_RULES_VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_v1": {
            "scan": "/api/v1/scan",
            "scan_file": "/api/v1/scan-file",
            "samples": "/api/v1/samples",
            "export_report": "/api/v1/export-report",
            "detect_ai": "/api/v1/detect-ai",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
