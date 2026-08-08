"""Declarative base for VidhyaBharathi models.

IMPORTANT: every tenant table must inherit TenantModel (or otherwise carry a
`school_id` column). This is what makes school-level scoping possible. Tables
without school_id can only be branch-wide reference data.
"""
from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class TenantModel(Base):
    """Mixin base: guarantees every school-owned table has a school_id.

    Example:
        class Student(TenantModel):
            __tablename__ = "students"
            student_id = Column(BigInteger, primary_key=True)
            name = Column(String)
    """
    __abstract__ = True
    school_id = Column(String(20), nullable=False, index=True)
