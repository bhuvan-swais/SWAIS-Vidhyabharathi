"""Vidyarthi (student) module — SWAIS VidhyaBharathi.

Ported from the Demo Student-Dashboard (raw psycopg) to SQLAlchemy on the shared
BVK backend: uses the branch DB (DEMO -> dem_prod), the shared auth (role gate),
and the models in db/models/vidyarthi.py (typed to the live dem_prod schema).

Fixes carried over from the demo:
- /students/current no longer returns a hardcoded student — it reads the row for
  the logged-in student (token user_id).
- submissions use the REAL table dem_student_submission (the demo wrote to
  dem_assignment_submissions, which does not exist in dem_prod).
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user, require_role
from app.core.scoping import get_branch_db
from app.db.models.vidyarthi import (
    StudentMaster, ChapterContent, StudentLearningProfile,
    AssignmentMaster, StudentSubmission, AssessmentResult,
    ChapterMaster, QuizMaster, QuizResponse, StudentMarks, SubjectMaster, ExamMaster,
)
from app.services.ai_learning_path_service import generate_learning_path

router = APIRouter(prefix="/vidyarthi", tags=["vidyarthi"])
STUDENT = require_role("Vidyarthi")


# ----------------------------- profile -----------------------------
@router.get("/students/current")
def current_student(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    s = db.query(StudentMaster).filter(StudentMaster.student_id == user["user_id"]).first()
    if not s:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found")
    return {
        "student": {
            "student_id": s.student_id, "full_name": s.full_name,
            "admission_no": s.admission_no, "class_id": s.class_id,
            "section": s.section, "roll_no": s.roll_no, "email_id": s.email_id,
        }
    }


# ----------------------------- chapters -----------------------------
@router.get("/chapter-content")
def chapter_content(chapter_id: int = Query(...), db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    row = (db.query(ChapterContent)
           .filter(ChapterContent.chapter_id == chapter_id, ChapterContent.is_active.is_(True))
           .first())
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chapter content not found")
    return {"chapter_id": row.chapter_id, "title": row.content_title,
            "content": row.full_text_content, "language": row.language_code}


# ----------------------------- assignments + submissions -----------------------------
@router.get("/assignments")
def assignments(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = db.query(AssignmentMaster).order_by(AssignmentMaster.due_date.desc()).all()
    return [{"assignment_id": a.assignment_id, "title": a.assignment_title,
             "text": a.assignment_text, "due_date": a.due_date, "chapter_id": a.chapter_id}
            for a in rows]


class SubmissionIn(BaseModel):
    assignment_id: int = Field(..., ge=1)
    submission_text: str | None = Field(default=None, max_length=20000)
    file_path: str | None = None


@router.post("/submissions")
def submit(body: SubmissionIn, db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    if not (body.submission_text or "").strip() and not body.file_path:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Type an answer or attach a file")
    sub = StudentSubmission(
        assignment_id=body.assignment_id, student_id=user["user_id"],
        submission_text=body.submission_text, file_path=body.file_path,
        submitted_at=datetime.utcnow(), record_status="Submitted",
    )
    db.add(sub)
    db.commit()
    return {"submission_id": sub.submission_id, "status": "Submitted"}


@router.get("/submissions")
def my_submissions(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = (db.query(StudentSubmission)
            .filter(StudentSubmission.student_id == user["user_id"])
            .order_by(StudentSubmission.submitted_at.desc()).all())
    return [{"submission_id": r.submission_id, "assignment_id": r.assignment_id,
             "marks_obtained": r.marks_obtained, "teacher_remarks": r.teacher_remarks,
             "submitted_at": r.submitted_at} for r in rows]


# ----------------------------- results / progress -----------------------------
@router.get("/results")
def my_results(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = db.query(AssessmentResult).filter(AssessmentResult.student_id == user["user_id"]).all()
    return [{"assessment_id": r.assessment_id, "marks_obtained": r.marks_obtained,
             "percentage": r.percentage, "is_absent": r.is_absent} for r in rows]


# ----------------------------- AI learning path -----------------------------
class LearningProfileIn(BaseModel):
    chapter_id: int = Field(..., ge=1)
    chapter_title: str = Field(..., min_length=1, max_length=160)
    reading_time_minutes: int = Field(..., ge=0, le=600)
    quiz_score: int = Field(..., ge=0, le=100)
    retry_count: int = Field(..., ge=0, le=50)
    comprehension_score: int = Field(..., ge=0, le=100)


def _classify_reader(reading_time_minutes: int, comprehension_score: int) -> str:
    if reading_time_minutes <= 15 and comprehension_score >= 70:
        return "Fast Reader"
    if reading_time_minutes >= 40 or comprehension_score < 50:
        return "Slow Reader"
    return "Average Reader"


@router.post("/learning-profile")
def save_learning_profile(body: LearningProfileIn, db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    metrics = {
        "reading_time_minutes": body.reading_time_minutes, "quiz_score": body.quiz_score,
        "retry_count": body.retry_count, "comprehension_score": body.comprehension_score,
    }
    generated_path = generate_learning_path(body.chapter_title, metrics)
    classification = generated_path.get("classification") or _classify_reader(
        body.reading_time_minutes, body.comprehension_score)
    existing = (db.query(StudentLearningProfile)
                .filter(StudentLearningProfile.student_id == user["user_id"],
                        StudentLearningProfile.chapter_id == body.chapter_id).first())
    if existing:
        existing.reading_time_minutes = body.reading_time_minutes
        existing.quiz_score = body.quiz_score
        existing.retry_count = body.retry_count
        existing.comprehension_score = body.comprehension_score
        existing.reader_classification = classification
        existing.generated_path = generated_path
        existing.updated_at = datetime.utcnow()
    else:
        db.add(StudentLearningProfile(
            student_id=user["user_id"], chapter_id=body.chapter_id, chapter_title=body.chapter_title,
            reading_time_minutes=body.reading_time_minutes, quiz_score=body.quiz_score,
            retry_count=body.retry_count, comprehension_score=body.comprehension_score,
            reader_classification=classification, generated_path=generated_path,
            created_at=datetime.utcnow(), updated_at=datetime.utcnow(),
        ))
    db.commit()
    return {"reader_classification": classification, "generated_path": generated_path}


@router.get("/learning-profile")
def get_learning_profile(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = db.query(StudentLearningProfile).filter(
        StudentLearningProfile.student_id == user["user_id"]).all()
    return [{"chapter_id": r.chapter_id, "chapter_title": r.chapter_title,
             "reader_classification": r.reader_classification,
             "generated_path": r.generated_path} for r in rows]


@router.post("/learning-path/generate")
def learning_path_generate(body: LearningProfileIn, user: dict = Depends(STUDENT)):
    """Generate a personalized learning path (rule-based; DeepSeek if configured).
    Mirrors the demo's POST /learning-path/generate."""
    return generate_learning_path(
        chapter_title=body.chapter_title,
        metrics={
            "reading_time_minutes": body.reading_time_minutes,
            "quiz_score": body.quiz_score,
            "retry_count": body.retry_count,
            "comprehension_score": body.comprehension_score,
        },
    )


# ----------------------------- chapters + subjects -----------------------------
@router.get("/subjects")
def subjects(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = db.query(SubjectMaster).order_by(SubjectMaster.subject_id).all()
    return [{"subject_id": s.subject_id, "subject_name": s.subject_name,
             "subject_code": getattr(s, "subject_code", None), "class_id": s.class_id}
            for s in rows]


@router.get("/chapters")
def chapters(subject_id: int | None = Query(default=None),
             db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    q = db.query(ChapterMaster)
    if subject_id:
        q = q.filter(ChapterMaster.subject_id == subject_id)
    rows = q.order_by(ChapterMaster.chapter_order, ChapterMaster.chapter_no).all()
    subs = {s.subject_id: s.subject_name for s in db.query(SubjectMaster).all()}
    return [{"chapter_id": ch.chapter_id, "chapter_no": ch.chapter_no,
             "chapter_name": ch.chapter_name, "description": ch.chapter_description,
             "subject_id": ch.subject_id, "subject_name": subs.get(ch.subject_id)}
            for ch in rows]


# ----------------------------- quizzes -----------------------------
@router.get("/quizzes")
def quizzes(chapter_id: int | None = Query(default=None),
            db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    q = db.query(QuizMaster)
    if chapter_id:
        q = q.filter(QuizMaster.chapter_id == chapter_id)
    rows = q.order_by(QuizMaster.quiz_id).all()
    # which quizzes has this student already completed?
    done = {r.quiz_id: float(r.score) if r.score is not None else None
            for r in db.query(QuizResponse).filter(QuizResponse.student_id == user["user_id"]).all()}
    return [{"quiz_id": z.quiz_id, "chapter_id": z.chapter_id, "quiz_title": z.quiz_title,
             "total_marks": z.total_marks, "duration_minutes": z.duration_minutes,
             "my_score": done.get(z.quiz_id), "attempted": z.quiz_id in done}
            for z in rows]


class QuizResponseIn(BaseModel):
    quiz_id: int = Field(..., ge=1)
    score: float = Field(..., ge=0)


@router.post("/quiz-responses")
def save_quiz_response(body: QuizResponseIn, db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    resp = QuizResponse(
        quiz_id=body.quiz_id, student_id=user["user_id"], score=body.score,
        completed_flag=True, created_datetime=datetime.utcnow(), record_status="Active",
    )
    db.add(resp)
    db.commit()
    return {"response_id": resp.response_id, "quiz_id": resp.quiz_id, "score": float(resp.score)}


@router.get("/quiz-responses")
def my_quiz_responses(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = (db.query(QuizResponse)
            .filter(QuizResponse.student_id == user["user_id"])
            .order_by(QuizResponse.created_datetime.desc()).all())
    return [{"response_id": r.response_id, "quiz_id": r.quiz_id,
             "score": float(r.score) if r.score is not None else None,
             "completed": r.completed_flag, "at": r.created_datetime} for r in rows]


# ----------------------------- progress (marks) -----------------------------
@router.get("/marks")
def my_marks(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = db.query(StudentMarks).filter(StudentMarks.student_id == user["user_id"]).all()
    subs = {s.subject_id: s.subject_name for s in db.query(SubjectMaster).all()}
    exams = {e.exam_id: e.exam_name for e in db.query(ExamMaster).all()}
    out = []
    for m in rows:
        obtained = float(m.marks_obtained) if m.marks_obtained is not None else None
        mx = float(m.max_marks) if m.max_marks is not None else None
        pct = round(obtained / mx * 100, 1) if (obtained is not None and mx) else None
        out.append({"marks_id": m.marks_id, "subject": subs.get(m.subject_id),
                    "exam": exams.get(m.exam_id), "marks_obtained": obtained,
                    "max_marks": mx, "percentage": pct, "grade": m.grade, "remarks": m.remarks})
    return out


@router.get("/exams")
def exams(db=Depends(get_branch_db), user: dict = Depends(STUDENT)):
    rows = db.query(ExamMaster).order_by(ExamMaster.exam_id).all()
    return [{"exam_id": e.exam_id, "exam_name": e.exam_name, "exam_type": e.exam_type,
             "academic_year": e.academic_year, "start_date": e.start_date, "end_date": e.end_date}
            for e in rows]
