from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class InterventionCreate(BaseModel):
    recommendation: str
    status: str = "pending"
    outcome_metrics: Optional[Dict] = None


class InterventionOut(BaseModel):
    id: int
    student_id: int
    recommendation: str
    status: str
    outcome_metrics: Optional[Dict]
    created_at: datetime

    class Config:
        from_attributes = True
