# Database — SWAIS VidhyaBharathi

- **Prefix:** every table is `vb_*`.
- **Tenancy:** one database **per branch** (BVK1, BVK2 …). Within a branch,
  schools share tables, separated by a **`school_id`** column on every table.
  (See [TENANCY.md](TENANCY.md). This follows Murthy sir's model — DB-per-branch —
  which supersedes the "single DB" note in the older product-design doc.)
- **Audit:** create/update timestamps on all tables + `vb_audit_log` + an
  audit-stamp trigger.
- **Migrations:** Alembic, run against **every** branch DB.

## Table groups

| Group | Tables |
|---|---|
| Organization | `vb_trust`, `vb_school`, `vb_academic_year`, `vb_class`, `vb_section`, `vb_subject` |
| Users & roles | `vb_user`, `vb_vidyarthi`, `vb_acharya`, `vb_palaka`, `vb_pradhana_acharya`, `vb_nyasa_member`, `vb_student_guardian`, `vb_teacher_assignment` |
| Curriculum | `vb_chapter_master`, `vb_chapter_content` (text + source_pdf_key + language_code), `vb_competency`, `vb_chapter_competency` |
| Teaching & assessment | `vb_lesson_plan`, `vb_note`, `vb_question_paper`, `vb_worksheet`, `vb_assessment`, `vb_assessment_result`, `vb_homework` |
| Panchakosha | `vb_kosha`, `vb_panchakosha_indicator`, `vb_panchakosha_score` |
| Samskara & Seva | `vb_values_content`, `vb_prarthana_schedule`, `vb_seva_activity`, `vb_reflection` |
| Granthalaya | `vb_book_category`, `vb_book`, `vb_book_request`, `vb_content_report`, `vb_reading_activity`, `vb_notification` |
| Admin (Prashasana) | `vb_admission`, `vb_fee`, `vb_fee_payment`, `vb_attendance`, `vb_transport`, `vb_hostel`, `vb_staff` |
| AI | `vb_ai_conversation`, `vb_ai_message` |
| Central (separate central DB) | AI token/billing metering, cross-branch Nyasa aggregates |

> ERD diagram is maintained separately (see the product-design doc).

## Modeling rule
Every school-owned table inherits `TenantModel` (`app/db/models` → `db/session.py`),
which guarantees the `school_id` column. Reference data that is branch-wide (not
school-specific) may omit it, but must be reviewed.

Granthalaya models are implemented in `app/db/models/granthalaya.py` as the
reference example for the other groups.
