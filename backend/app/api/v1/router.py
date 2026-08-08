"""v1 API router — mounts every VidhyaBharathi module under /api/v1."""
from fastapi import APIRouter

from app.api.v1 import (
    pravesha,      # login & auth
    vidyarthi,     # student portal
    acharya,       # teacher portal
    palaka,        # parent portal
    pradhana,      # principal dashboard
    nyasa,         # trust / network dashboard
    panchakosha,   # holistic development index
    samskara,      # values & seva
    granthalaya,   # digital library
    prashasana,    # administration
)

api_router = APIRouter()
for module in (
    pravesha, vidyarthi, acharya, palaka, pradhana,
    nyasa, panchakosha, samskara, granthalaya, prashasana,
):
    api_router.include_router(module.router)
