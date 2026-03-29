import sys
import os

backend_dir = r"f:\InsightU\InsightU\backend"
sys.path.append(backend_dir)
os.chdir(backend_dir)

from app.db.session import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        if engine.dialect.name == "mysql":
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
            tables = ["audit_logs", "teacher_students", "explanations", "predictions", "interventions", "alerts", "behavioral_logs", "attendance_records", "academic_records", "students", "study_materials", "users"]
            for t in tables:
                conn.execute(text(f"TRUNCATE TABLE {t};"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
        else:
            conn.execute(text("PRAGMA foreign_keys = OFF;"))
            tables = ["audit_logs", "teacher_students", "explanations", "predictions", "interventions", "alerts", "behavioral_logs", "attendance_records", "academic_records", "students", "study_materials", "users"]
            for t in tables:
                conn.execute(text(f"DELETE FROM {t};"))
            conn.execute(text("PRAGMA foreign_keys = ON;"))
    print("Successfully wiped all data/accounts.")
except Exception as e:
    print(f"Error occurred: {e}")
