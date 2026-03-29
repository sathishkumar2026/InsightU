from dataclasses import dataclass
from typing import Dict, List
import numpy as np
import pandas as pd


@dataclass
class StudentFeatures:
    student_id: int
    academic_variance: float
    sudden_drop: float
    attendance_trend: float
    behavioral_delay_mean: float
    behavioral_inactive_mean: float
    load_estimate: float


FEATURE_COLUMNS = [
    "academic_variance",
    "sudden_drop",
    "attendance_trend",
    "behavioral_delay_mean",
    "behavioral_inactive_mean",
    "load_estimate",
]


def compute_features(academic_df: pd.DataFrame, attendance_df: pd.DataFrame, behavioral_df: pd.DataFrame) -> List[StudentFeatures]:
    features = []
    for student_id in sorted(set(academic_df["student_id"].unique()) | set(attendance_df["student_id"].unique()) | set(behavioral_df["student_id"].unique())):
        a = academic_df[academic_df["student_id"] == student_id].sort_values("date")
        b = attendance_df[attendance_df["student_id"] == student_id].sort_values("date")
        c = behavioral_df[behavioral_df["student_id"] == student_id].sort_values("date")

        if not a.empty:
            variance = float(np.var(a["score"].values))
            drops = np.diff(a["score"].values)
            sudden_drop = float(np.min(drops)) if len(drops) else 0.0
        else:
            variance = 0.0
            sudden_drop = 0.0

        if not b.empty:
            attendance_rate = b["attended"].rolling(window=5, min_periods=1).mean().values
            attendance_trend = float(attendance_rate[-1] - attendance_rate[0])
        else:
            attendance_trend = 0.0

        if not c.empty:
            delay_mean = float(np.mean(c["assignment_delay_days"].values))
            inactive_mean = float(np.mean(c["lms_inactive_days"].values))
        else:
            delay_mean = 0.0
            inactive_mean = 0.0

        load_estimate = float((len(a) + len(c)) / 10.0)
        features.append(
            StudentFeatures(
                student_id=student_id,
                academic_variance=variance,
                sudden_drop=abs(sudden_drop),
                attendance_trend=attendance_trend,
                behavioral_delay_mean=delay_mean,
                behavioral_inactive_mean=inactive_mean,
                load_estimate=load_estimate,
            )
        )
    return features


def to_dataframe(features: List[StudentFeatures]) -> pd.DataFrame:
    return pd.DataFrame([f.__dict__ for f in features])
