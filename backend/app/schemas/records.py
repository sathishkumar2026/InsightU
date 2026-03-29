from pydantic import BaseModel
from datetime import date


class AcademicRecordCreate(BaseModel):
    student_id: int
    subject: str
    score: float
    term: str
    date: date


class AttendanceRecordCreate(BaseModel):
    student_id: int
    attended: bool
    date: date


class BehavioralLogCreate(BaseModel):
    student_id: int
    assignment_delay_days: int
    lms_inactive_days: int
    date: date
