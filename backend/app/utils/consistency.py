from typing import List, Tuple


def compute_flags(academic_variance: float, sudden_drop: float, attendance_trend: float, behavioral_drift: bool) -> List[str]:
    flags = []
    if academic_variance > 50:
        flags.append("academic_variance")
    if sudden_drop > 15:
        flags.append("sudden_drop")
    if attendance_trend < -0.1:
        flags.append("attendance_decline")
    if behavioral_drift:
        flags.append("behavioral_drift")
    return flags


def consistency_index_from_risk(risk: float) -> float:
    return max(0.0, min(100.0, 100.0 - (risk * 100.0)))
