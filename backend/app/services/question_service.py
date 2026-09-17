import io
import re
import json
from typing import List, Dict
import pdfplumber

from app.services.ai_service import _chat

def extract_text_from_pdf(file_bytes: bytes) -> str:
    parts: List[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")
    return "\n".join(parts).strip()


def _coerce_questions(data) -> List[Dict]:
    if not isinstance(data, list):
        return []
    out: List[Dict] = []
    for i, q in enumerate(data):
        if not isinstance(q, dict):
            continue
        text = (q.get("question") or q.get("text") or "").strip()
        if not text:
            continue
        try:
            marks = int(q.get("maxMarks") or q.get("marks") or q.get("max_marks") or 1)
        except (TypeError, ValueError):
            marks = 1
        qtype = str(q.get("type") or "short").lower()
        if qtype not in ("mcq", "short", "long"):
            qtype = "short"
        options = q.get("options") if isinstance(q.get("options"), list) else []
        out.append({
            "id": len(out) + 1,
            "question": text,
            "maxMarks": max(1, marks),
            "type": qtype,
            "options": options,
        })
    return out


def _parse_ai_json(reply: str) -> List[Dict]:
    if not reply:
        return []
    match = re.search(r"\[.*\]", reply, re.DOTALL)
    if not match:
        return []
    try:
        return _coerce_questions(json.loads(match.group(0)))
    except (json.JSONDecodeError, TypeError):
        return []


def _regex_questions(raw: str) -> List[Dict]:
    out: List[Dict] = []
    for line in raw.splitlines():
        line = line.strip()
        m = re.match(r"^(?:Q\s*\.?\s*)?\d+\s*[\.\)]\s*(.+)$", line)
        if not m:
            continue
        text = m.group(1).strip()
        marks = 1
        mm = re.search(r"[\(\[]\s*(\d+)\s*(?:marks?|mks?|m)?\s*[\)\]]", text, re.IGNORECASE)
        if mm:
            marks = int(mm.group(1))
        out.append({
            "id": len(out) + 1,
            "question": text,
            "maxMarks": max(1, marks),
            "type": "short",
            "options": [],
        })
    return out


async def extract_questions(file_bytes: bytes, acharya) -> List[Dict]:
    raw = extract_text_from_pdf(file_bytes)
    if not raw:
        return []

    prompt = (
        "You are given the text of a question paper. Extract every question as a JSON array. "
        'Each item must be: {"question": string, "maxMarks": integer, '
        '"type": "mcq" | "short" | "long", "options": [string] (only for mcq)}. '
        "Infer maxMarks from markers like (5) or [2 marks]; use 1 if unknown. "
        "Return ONLY the JSON array, no commentary.\n\nQuestion paper:\n" + raw[:6000]
    )
    try:
        reply = await _chat(prompt, "English", acharya)
        questions = _parse_ai_json(reply)
    except Exception:
        questions = []

    if not questions:
        questions = _regex_questions(raw)
    return questions