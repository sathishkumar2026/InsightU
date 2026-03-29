from pydantic import BaseModel
from typing import Optional
from datetime import date


class StudentCreate(BaseModel):
    user_id: Optional[int] = None
    cohort: Optional[str] = None
    program: Optional[str] = None
    enrollment_date: Optional[date] = None


class StudentOut(StudentCreate):
    id: int

    class Config:
        from_attributes = True
