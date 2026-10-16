"""Validated request/response contracts for the Vidya Bharati backend."""
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
LongText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100000)]


class Contract(BaseModel):
    model_config = ConfigDict(extra='forbid')


class LessonRequest(Contract):
    teacher_name: Text
    grade_level: Text
    section: Text = 'A'
    subject: Text
    topic: Text
    textbook_content: LongText
    no_of_periods: int = Field(default=1, ge=1, le=50)
    language: Text = 'English'


class LessonPlan(Contract):
    learning_objectives: list[Text] = Field(min_length=3, max_length=6)
    learning_outcomes: list[Text] = Field(min_length=3, max_length=6)
    methodology: list[LongText] = Field(min_length=1)
    teaching_learning_materials: list[Text] = Field(min_length=1)
    activities: list[LongText] = Field(min_length=1)
    assessment: list[LongText] = Field(min_length=1)
    homework: list[LongText] = Field(min_length=1)


class LessonResponse(Contract):
    status: Literal['success'] = 'success'
    metadata: LessonRequest
    lesson_plan: LessonPlan
