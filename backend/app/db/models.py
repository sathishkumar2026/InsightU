from sqlalchemy import Column, Integer, String, Date, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("Student", back_populates="user", uselist=False)


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cohort = Column(String(120), nullable=True)
    program = Column(String(120), nullable=True)
    enrollment_date = Column(Date, nullable=True)
    user = relationship("User", back_populates="student")
    academic_records = relationship("AcademicRecord", back_populates="student")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    behavioral_logs = relationship("BehavioralLog", back_populates="student")


class AcademicRecord(Base):
    __tablename__ = "academic_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String(120), nullable=False)
    score = Column(Float, nullable=False)
    term = Column(String(50), nullable=True)
    date = Column(Date, nullable=False)
    student = relationship("Student", back_populates="academic_records")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    attended = Column(Boolean, nullable=False)
    date = Column(Date, nullable=False)
    student = relationship("Student", back_populates="attendance_records")


class BehavioralLog(Base):
    __tablename__ = "behavioral_logs"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    assignment_delay_days = Column(Integer, nullable=False)
    lms_inactive_days = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    student = relationship("Student", back_populates="behavioral_logs")


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    consistency_index = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    flags = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Explanation(Base):
    __tablename__ = "explanations"
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    summary_text = Column(String(500), nullable=False)
    feature_json = Column(JSON, nullable=False)
    rule_path_json = Column(JSON, nullable=False)


class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    recommendation = Column(String(500), nullable=False)
    status = Column(String(50), default="pending")
    outcome_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    severity = Column(String(50), nullable=False)
    message = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    detail = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class StudyMaterial(Base):
    __tablename__ = "study_materials"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    faculty_name = Column(String(120), nullable=False)
    subject = Column(String(120), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)   # e.g. "pdf", "docx"
    file_size = Column(Integer, nullable=False)       # bytes
    visibility = Column(String(50), default="everyone")  # "everyone" or "my_students"
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class TeacherStudent(Base):
    __tablename__ = "teacher_students"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String(120), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

