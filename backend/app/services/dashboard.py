from sqlalchemy import text
from sqlalchemy.orm import Session


def get_dashboard(db: Session) -> dict:
    school = db.execute(
        text("""
            SELECT school_id, school_name, city, state
            FROM vb_school_master
            WHERE school_id = 1
            LIMIT 1
        """)
    ).mappings().first()

    classes = db.execute(
        text("""
            SELECT
                c.class_id,
                c.class_name,
                c.section_name,
                COUNT(s.student_id) AS students
            FROM vb_class_master c
            LEFT JOIN vb_student_master s
                ON s.class_id = c.class_id
            WHERE c.school_id = 1
              AND COALESCE(c.record_status, 'ACTIVE') <> 'DELETED'
            GROUP BY c.class_id, c.class_name, c.section_name
            ORDER BY c.class_id
        """)
    ).mappings().all()

    teachers = db.execute(
        text("""
            SELECT
                teacher_id,
                full_name,
                subject_name,
                role,
                is_active
            FROM vb_teacher_master
            WHERE COALESCE(is_active, true) = true
            ORDER BY teacher_id
        """)
    ).mappings().all()

    subjects = db.execute(
        text("""
            SELECT
                subject_id,
                subject_name,
                subject_code,
                class_id,
                teacher_id
            FROM vb_subject_master
            ORDER BY subject_id
        """)
    ).mappings().all()

    students = db.execute(
        text("""
            SELECT
                s.student_id,
                s.full_name,
                s.class_id,
                s.section,
                s.roll_no,
                s.is_active,
                c.class_name
            FROM vb_student_master s
            LEFT JOIN vb_class_master c
                ON c.class_id = s.class_id
            WHERE s.class_id IN (
                SELECT class_id
                FROM vb_class_master
                WHERE school_id = 1
            )
            ORDER BY s.student_id
        """)
    ).mappings().all()

    marks = db.execute(
        text("""
            SELECT
                sm.marks_id,
                sm.student_id,
                sm.subject_id,
                sm.marks_obtained,
                sm.max_marks,
                sm.grade,
                sub.subject_name
            FROM vb_student_marks sm
            LEFT JOIN vb_subject_master sub
                ON sub.subject_id = sm.subject_id
            ORDER BY sm.marks_id
        """)
    ).mappings().all()

    notices = db.execute(
        text("""
            SELECT
                notice_id,
                notice_title,
                notice_text,
                notice_date,
                applicable_class,
                applicable_to
            FROM vb_notice_board
            ORDER BY notice_date DESC NULLS LAST
            LIMIT 10
        """)
    ).mappings().all()

    notifications = db.execute(
        text("""
            SELECT
                notification_id,
                type,
                message,
                is_read,
                created_at,
                user_role
            FROM vb_notification
            WHERE school_id = '1'
            ORDER BY created_at DESC NULLS LAST
            LIMIT 10
        """)
    ).mappings().all()

    student_count = len(students)
    class_count = len(classes)
    teacher_count = len(teachers)

    valid_marks = [
        float(row["marks_obtained"])
        for row in marks
        if row["marks_obtained"] is not None
    ]

    average_score = (
        round(sum(valid_marks) / len(valid_marks), 1)
        if valid_marks
        else 0
    )

    class_data = []

    for row in classes:
        class_name = row["class_name"] or "Unknown"
        section = row["section_name"] or ""

        display_name = (
            f"{class_name} - {section}"
            if section
            else class_name
        )

        class_data.append({
            "name": display_name,
            "students": int(row["students"] or 0),
            "score": 0,
        })

    subject_scores = {}

    for row in marks:
        subject = row["subject_name"] or "Unknown"

        if row["marks_obtained"] is not None:
            subject_scores.setdefault(subject, []).append(
                float(row["marks_obtained"])
            )

    subjects_data = [
        {
            "name": name,
            "score": round(sum(scores) / len(scores), 1),
        }
        for name, scores in subject_scores.items()
    ]

    return {
        "institution": {
            "name": school["school_name"] if school else "",
            "product": "VIDHYABHARATHI • SCHOOL INTELLIGENCE",
            "role": "Pradhana Acharya",
            "role_title": "Pradhana Acharya",
            "city": school["city"] if school else "",
            "state": school["state"] if school else "",
        },

        "kpis": [
            {
                "title": "Students",
                "value": student_count,
                "change": 0,
            },
            {
                "title": "Classes",
                "value": class_count,
                "change": 0,
            },
            {
                "title": "Teachers",
                "value": teacher_count,
                "change": 0,
            },
            {
                "title": "Academic Average",
                "value": f"{average_score}%",
                "change": 0,
            },
        ],

        "attendance": {
            "overall": 0,
            "present": 0,
            "absent": 0,
            "bars": [],
            "present_change": 0,
            "absent_change": 0,
            "trend": [],
            "below_90_count": 0,
            "below_90_change": 0,
            "below_target": [],
        },

        "academic": {
            "average": average_score,
            "change": 0,
            "subjects": subjects_data,
            "pass_rate": 0,
            "pass_change": 0,
            "top_subject": (
                max(subjects_data, key=lambda x: x["score"])["name"]
                if subjects_data
                else ""
            ),
            "top_score": (
                max(subjects_data, key=lambda x: x["score"])["score"]
                if subjects_data
                else 0
            ),
            "term_label": "Current",
        },

        "class_analytics": {
            "active_classes": class_count,
            "active_change": 0,
            "top_class": "",
            "top_score": 0,
            "students": student_count,
            "classes": class_data,
        },

        "teacher_insights": {
            "total": teacher_count,
            "total_change": 0,
            "average": 0,
            "average_change": 0,
            "assignments": 0,
            "assignment_label": "No assessment data",
            "improvement": 0,
            "improvement_label": "No assessment data",
            "sections": [],
        },

        "alerts": {
            "total": len(notices) + len(notifications),
            "total_label": "Active alerts",
            "high_priority": 0,
            "priority_label": "No priority data",
            "academic": 0,
            "academic_label": "No assessment data",
            "attendance": 0,
            "attendance_label": "No attendance source",
            "items": [
                {
                    "title": row["notice_title"] or "Notice",
                    "description": row["notice_text"] or "",
                    "tone": "info",
                    "time": (
                        str(row["notice_date"])
                        if row["notice_date"]
                        else ""
                    ),
                }
                for row in notices
            ],
        },

        "enrollment": {
            "new_admissions": 0,
        },

        "student_growth": {
            "value": student_count,
            "change": 0,
        },

        "insights": {
            "summary": (
                f"{student_count} students across "
                f"{class_count} classes with "
                f"{teacher_count} active teachers."
            ),
            "improvement": (
                "Assessment and attendance data are not "
                "currently available in the database."
            ),
            "items": [],
            "academic_status": (
                "Available"
                if marks
                else "No assessment data"
            ),
            "teacher_status": (
                "Available"
                if teachers
                else "No teacher data"
            ),
        },

        "meta": {
            "school_id": school["school_id"] if school else None,
            "data_source": "vb_prod",
            "read_only": True,
        },
    }