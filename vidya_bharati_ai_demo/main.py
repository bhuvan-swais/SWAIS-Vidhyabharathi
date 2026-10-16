"""Vidya Bharati AI backend: lesson planner."""
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv(Path(__file__).with_name('.env'))

from ai_service import generate_structured, lesson_prompt
from schemas import LessonPlan, LessonRequest, LessonResponse

app = FastAPI(title='Vidya Bharati AI Lesson Planner', version='1.0.0')


@app.get('/health')
def health():
    return {'status': 'ok', 'project': 'Vidya Bharati AI'}


@app.post('/api/v1/lesson-plans/generate', response_model=LessonResponse)
def generate_lesson_plan(req: LessonRequest):
    plan = generate_structured(lesson_prompt(req), LessonPlan)
    return LessonResponse(metadata=req, lesson_plan=plan)
