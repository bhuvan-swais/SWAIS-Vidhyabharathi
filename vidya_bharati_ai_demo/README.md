# Vidya Bharati AI Lesson Planner

Independent backend adapted from the SSS faculty lesson-plan prompt.
No UI, reference-project imports, or database connection. One AI endpoint:

| Method | URL | Result |
| --- | --- | --- |
| POST | `/api/v1/lesson-plans/generate` | Structured lesson plan |
| GET | `/health` | Backend health; does not check Gemini |

## Run

```powershell
cd vidya_bharati_ai_demo
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8003
```

Fill in `GEMINI_API_KEY` and `GEMINI_MODEL` in this folder's `.env`, using a model
available to your account. Restart after credential changes. Credentials are not
copied from SSS. `.env` is excluded by `.gitignore`.

Use http://127.0.0.1:8003/docs to send requests (API docs, not a product UI).
The responses contain teacher-facing answers; do not expose this endpoint directly
to students when integrating into Vidya Bharati. Add the project's authentication
and authorization before deployment. Generation sends supplied textbook text to Gemini.

## Lesson planner request

```json
{
  "teacher_name": "Swati",
  "grade_level": "8",
  "section": "A",
  "subject": "Science",
  "topic": "Combustion",
  "textbook_content": "Combustion is a chemical process in which a substance reacts with oxygen to give off heat. Fuel, oxygen and ignition temperature are necessary for combustion.",
  "no_of_periods": 2,
  "language": "English"
}
```

Returns `status`, `metadata`, and `lesson_plan`, with learning objectives/outcomes,
methodology, teaching materials, activities, assessment and homework. Supply the
actual chapter content to generate a meaningful plan. No uploaded-file extraction
is included; input is plain text.

## Errors and verification

- `422`: Invalid request or blank required content.
- `503`: Missing Gemini settings or SDK.
- `502`: Provider failure or invalid generated content.

Offline validation checks (no API key needed):

```powershell
python -m pip install httpx
python -m unittest discover -s tests -v
```

The tests use a mocked AI response. They do not verify live Gemini generation.

## Database tables

No tables are needed to generate and return a lesson plan.
Nothing is saved and AI usage is not persisted in this initial version.

If the project needs saving/tracking, check whether equivalent tables already exist:

- Lesson plans: id, teacher/user id, class/section, subject, topic, plan content,
  periods, created_at.
- AI usage logs: id, user id, feature, model, prompt/output token counts, created_at.

These are suggested data requirements, not migrations or required table names.
Existing Vidya Bharati tables can be mapped once their schemas are shared.

## Verification

Live Gemini generation was successfully tested on 15 October 2026.
Offline tests also verify validation and endpoint behavior without calling Gemini.
Copy `.env.example` to `.env` and configure your own credentials before running.
This standalone demo is not yet integrated with the main platform backend.
