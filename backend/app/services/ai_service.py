import re
import httpx
from fastapi import HTTPException, status

from app.core.config import settings

_TIMEOUT = 60.0


# ── Helpers ──────────────────────────────────────────────────────────────────

def _user_info(acharya) -> dict:
    """
    Safely extract user info from the VbAcharya model.
    school_id is passed as None since the multi-tenant boundary was deprecated.
    """
    # FIXED: Replaced first_name with username and login_id with email
    name = getattr(acharya.user, "username", "") if hasattr(acharya, "user") and acharya.user else ""
    email = getattr(acharya.user, "email", "") if hasattr(acharya, "user") and acharya.user else ""
    
    return {
        "id": acharya.teacher_id, # FIXED: Mapped to teacher_id
        "user_id": acharya.user_id,
        "school_id": None, # FIXED: Safely passing None to prevent DB crashes
        "name": name,
        "email": email,
        "role": "Acharya",
    }


def _ai_error(e: Exception):
    if isinstance(e, httpx.TimeoutException):
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="AI service timed out")
    if isinstance(e, httpx.HTTPStatusError):
        try:
            body = e.response.json()
            detail = body.get("details") or body.get("error") or body.get("message") or "AI service error"
        except Exception:
            detail = "AI service error"
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service unreachable")


# Section headings exactly as the AI service emits them
_SECTIONS: list[tuple[str, str]] = [
    ("objectives",  "Learning objectives"),
    ("outcomes",    "Learning outcomes"),
    ("methodology", "Methodology"),
    ("tlm",         "TLM"),
    ("activities",  "Activities"),
    ("assessment",  "Assessment"),
    ("homework",    "Home Work"),
]

_ANY_HEADING = "|".join(re.escape(h) for _, h in _SECTIONS)

_ITEM_MARKER = re.compile(r'^(?:\d+[.)]|[-•*])\s+')


def _extract_section(text: str, heading: str) -> str:
    pattern = (
        rf'^[ \t]*{re.escape(heading)}[ \t]*:[ \t]*$\n'
        rf'(.*?)'
        rf'(?=^[ \t]*(?:{_ANY_HEADING})[ \t]*:[ \t]*$|^[ \t]*Sign\.|\Z)'
    )
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE | re.MULTILINE)
    return m.group(1).strip() if m else ""


def _bullets(block: str) -> list[str]:
    items: list[str] = []
    for line in block.split("\n"):
        line = line.strip()
        if not line:
            continue
        if _ITEM_MARKER.match(line):
            items.append(_ITEM_MARKER.sub('', line).strip())
        elif items:
            items[-1] = f"{items[-1]} {line}"
        else:
            items.append(line)
    return [i for i in items if i]


def _class_section(acharya) -> str:
    parts = []
    if acharya.class_id:
        parts.append(f"Class {acharya.class_id}")
    # FIXED: Updated section_1 to section
    if getattr(acharya, "section", None):
        parts.append(acharya.section)
    return " ".join(parts)


def _parse_lesson_plan(raw_text: str, header: dict, acharya) -> dict:
    sections = {key: _bullets(_extract_section(raw_text, heading))
                for key, heading in _SECTIONS}

    return {
        "title": f"Lesson Plan: {header['chapter']}" if header["chapter"] else "Lesson Plan",
        "header": header,
        "sections": sections,
        "chapter_text": header["chapter"],
        "duration_minutes": header["no_of_periods"],
        "class_name": str(acharya.class_id or ""),
        "section": getattr(acharya, "section", ""), # FIXED: Updated section_1 to section
        "subject": header["subject"],
        "objectives": sections["objectives"],
        "homework": "\n".join(sections["homework"]),
    }


# ── Internal chat caller ─────────────────────────────────────────────────────

async def _chat(message: str, target_language: str, acharya) -> str:
    payload = {
        "message": message,
        "targetLanguage": target_language,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/chat",
                json=payload,
            )
            r.raise_for_status()
            data = r.json()
            return data.get("reply") or data.get("message") or data.get("response") or ""
    except Exception as e:
        _ai_error(e)


# ── Public functions ──────────────────────────────────────────────────────────

async def generate_lesson_plan(req, acharya) -> dict:
    # FIXED: Replaced first_name with username
    user_name = getattr(acharya.user, "username", "") if hasattr(acharya, "user") and acharya.user else ""
    subject = getattr(acharya, "subject_name", "")
    
    header = {
        "school_name":          req.schoolName or settings.SCHOOL_NAME,
        "teacher_name":         user_name,
        "designation":          req.designation or "Acharya",
        "class_section":        req.classSection or _class_section(acharya),
        "subject":              req.subject or subject,
        "chapter":              req.chapter,
        "no_of_periods":        req.noOfPeriods,
        "date_of_commencement": req.dateOfCommencement.isoformat() if req.dateOfCommencement else "",
        "expected_completion":  req.expectedCompletion.isoformat() if req.expectedCompletion else "",
        "actual_completion":    "",
    }

    payload = {
        "chapterId": req.chapterId,
        "topic": req.chapter,
        "noOfPeriods": req.noOfPeriods,
        "durationMinutes": req.noOfPeriods * settings.PERIOD_MINUTES,
        "userInfo": _user_info(acharya),
    }

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/lesson-plan",
                json=payload,
            )
            r.raise_for_status()
            data = r.json()
            raw_text = data.get("lessonPlan", "")
            return _parse_lesson_plan(raw_text, header, acharya)
    except Exception as e:
        _ai_error(e)


async def generate_question_paper(
    chapter_id: int,
    difficulty: str,
    total_marks: int,
    acharya,
    question_type: str | None = None,
) -> dict:
    payload = {
        "chapterId": chapter_id,
        "difficulty": difficulty,
        "totalMarks": total_marks,
        "questionType": question_type,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/question-paper",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def correct_answer(
    question: str,
    student_answer: str,
    max_marks: int,
    rubric: str,
    acharya,
) -> dict:
    payload = {
        "question": question,
        "studentAnswer": student_answer,
        "maxMarks": max_marks,
        "rubric": rubric,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/correct-answer",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def get_assignment_reminders(acharya) -> dict:
    payload = {"userInfo": _user_info(acharya)}
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/assignment-reminders",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def get_completion_alerts(acharya) -> dict:
    payload = {"userInfo": _user_info(acharya)}
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/completion-alerts",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def virtual_slate(raw_text: str, action: str, acharya) -> dict:
    payload = {
        "rawText": raw_text,
        "action": action,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/virtual-slate",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def student_analytics(student_name: str, subject: str, acharya) -> dict:
    payload = {
        "studentName": student_name,
        "subject": subject,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/student-analytics",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def class_analytics(subject: str, acharya) -> dict:
    payload = {
        "subject": subject,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/class-analytics",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def translate_text(text: str, target_language: str, acharya) -> dict:
    payload = {
        "text": text,
        "targetLanguage": target_language,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/translate",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def translate_audio(audio_file: str, target_language: str, acharya) -> dict:
    payload = {
        "audioFile": audio_file,
        "targetLanguage": target_language,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/audio-translate",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def speech_to_text(audio_file: str, language: str, acharya) -> dict:
    payload = {
        "audioFile": audio_file,
        "language": language,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/speech-to-text",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def text_to_speech(text: str, language: str, voice: str, acharya) -> dict:
    payload = {
        "text": text,
        "language": language,
        "voice": voice,
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/speak",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)


async def content_search(subject: str, keyword: str, acharya) -> dict:
    payload = {
        "subject": subject,
        "keyword": keyword,
        "teacherId": acharya.teacher_id, # FIXED: Mapped to teacher_id
        "schoolId": None, # FIXED: Safely passing None to external API
        "userInfo": _user_info(acharya),
    }
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            r = await client.post(
                f"{settings.AI_SERVICE_URL}/api/v1/ai/teacher/content-search",
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        _ai_error(e)