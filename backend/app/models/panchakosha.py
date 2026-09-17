from sqlalchemy import Column, BigInteger, String, Integer
from app.db.session import Base

class VbPanchakoshaScore(Base):
    __tablename__ = "vb_panchakosha_scores"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    student_id = Column(BigInteger, nullable=False, index=True)
    category = Column(String(255), nullable=False)
    score = Column(Integer, nullable=False)
    remarks = Column(String(500), nullable=True)