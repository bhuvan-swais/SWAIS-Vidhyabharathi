"""SWAIS VidhyaBharathi — API entry point.

Single backend serving all role modules under /api/v1. Multi-tenant:
one database per branch (BVK1, BVK2, ...), schools separated by school_id.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import FRONTEND_ORIGIN
from app.api.v1.router import api_router

app = FastAPI(title="SWAIS VidhyaBharathi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "vb-api"}
