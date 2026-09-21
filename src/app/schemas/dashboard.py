from typing import Any

from pydantic import BaseModel, Field


class DashboardResponse(BaseModel):
    institution: dict[str, Any] = Field(default_factory=dict)
    kpis: dict[str, Any] = Field(default_factory=dict)
    attendance: dict[str, Any] = Field(default_factory=dict)
    academic: dict[str, Any] = Field(default_factory=dict)
    class_analytics: list[dict[str, Any]] = Field(default_factory=list)
    teacher_insights: list[dict[str, Any]] = Field(default_factory=list)
    alerts: list[dict[str, Any]] = Field(default_factory=list)
    ai_tools: list[dict[str, Any]] = Field(default_factory=list)