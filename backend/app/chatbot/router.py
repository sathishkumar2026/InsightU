from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.auth.deps import get_current_user
import random

router = APIRouter()


class ChatMessage(BaseModel):
    message: str


# ── knowledge base for the AI assistant ──────────

IMPROVEMENT_TIPS = {
    "attendance_trend": [
        "Set daily alarms for each class and treat attendance like a job commitment.",
        "Try sitting in the front row — it increases engagement and makes it harder to skip.",
        "Find a study buddy and hold each other accountable for attendance.",
        "Plan your commute to arrive 10 minutes early; the habit builds momentum.",
    ],
    "sudden_drop": [
        "Request extra office hours with your professor in the subject that dropped.",
        "Review past exams and assignments to identify which topics caused the drop.",
        "Consider joining a study group focused on that specific subject.",
        "Use the Resources tab to find study materials shared by your faculty.",
    ],
    "assignment_delays": [
        "Break large assignments into smaller daily tasks using a planner.",
        "Use the 2-minute rule: if a task takes less than 2 minutes, do it immediately.",
        "Set personal deadlines 2 days before the actual due date.",
        "Try the Pomodoro technique: 25 minutes focused work, then a 5-minute break.",
    ],
    "academic_variance": [
        "Allocate more study time to your weakest subjects rather than your best ones.",
        "Use active recall and spaced repetition for difficult subjects.",
        "Ask your faculty for additional resources in subjects where you struggle.",
        "Check the Resources page — your faculty may have uploaded helpful materials.",
    ],
    "behavioral_delay_mean": [
        "Create a weekly schedule that blocks time for each assignment.",
        "Avoid multitasking — focus on one assignment at a time.",
        "Use the Pomodoro technique: 25 minutes focused work, 5 minute break.",
        "Start assignments the day they're given, even if just for 15 minutes.",
    ],
    "behavioral_inactive_mean": [
        "Log into the LMS daily, even if just for 5 minutes to check updates.",
        "Enable push notifications from your learning management system.",
        "Set a daily reminder to review course announcements and materials.",
        "Download the LMS mobile app so you can check on the go.",
    ],
}

GENERAL_RESPONSES = {
    "greeting": "Hi there! 👋 I'm your InsightU AI assistant. I can help you understand your academic profile, explain why you were flagged, and suggest ways to improve. Try asking:\n\n• \"What's my Math score?\" — get subject-specific details\n• \"How can I improve?\" — personalized tips\n• \"Find study materials\" — access faculty resources\n• \"Why was I flagged?\" — understand your risk\n\nWhat would you like to know?",
    "about": "InsightU uses machine learning to identify students who may need additional support. It analyzes your academic scores, attendance patterns, and behavioral data to generate a consistency index and risk assessment. Everything is transparent — you can see exactly what factors contributed to your score.",
    "how_it_works": "The system works in three steps:\n\n1️⃣ Your faculty imports academic, attendance, and behavioral data.\n2️⃣ The ML pipeline analyzes patterns across all these data points.\n3️⃣ You get a consistency index (0-100) and personalized insights about what's driving your score.\n\nYou can ask me about any of these aspects!",
}


def _build_subject_response(subject_name, academic_records, all_records):
    """Build a detailed response about a specific subject."""
    subj_records = [r for r in academic_records if r.subject.lower() == subject_name.lower()]
    if not subj_records:
        # Try partial match
        subj_records = [r for r in academic_records if subject_name.lower() in r.subject.lower()]

    if not subj_records:
        available = list(set(r.subject for r in academic_records))
        if available:
            return f"I don't have records for \"{subject_name}\". Your subjects are: **{', '.join(available)}**. Ask me about any of them!"
        return "No academic records found yet. Once your faculty uploads your scores, I can tell you about each subject."

    subj_name = subj_records[0].subject
    scores = [r.score for r in subj_records]
    avg = sum(scores) / len(scores)
    latest = subj_records[-1].score
    highest = max(scores)
    lowest = min(scores)

    # Overall average for comparison
    all_scores = [r.score for r in all_records]
    overall_avg = sum(all_scores) / len(all_scores) if all_scores else 0

    response = f"📊 **{subj_name}** — Detailed Breakdown:\n\n"
    response += f"• Latest Score: **{latest:.0f}**\n"
    response += f"• Average: **{avg:.1f}** across {len(scores)} record(s)\n"
    response += f"• Range: {lowest:.0f} – {highest:.0f}\n"

    if len(scores) >= 2:
        trend = scores[-1] - scores[-2]
        if trend > 0:
            response += f"• Trend: 📈 **+{trend:.0f}** (improving!)\n"
        elif trend < 0:
            response += f"• Trend: 📉 **{trend:.0f}** (declining)\n"
        else:
            response += f"• Trend: ➡️ Stable\n"

    response += f"\nYour overall average is **{overall_avg:.1f}**. "
    if avg >= overall_avg + 5:
        response += f"{subj_name} is one of your **strongest subjects**! 🌟"
    elif avg <= overall_avg - 5:
        response += f"{subj_name} is below your average. Consider extra study time or check the **Resources** tab for materials."
    else:
        response += f"{subj_name} is right around your average."

    return response


def _generate_response(message: str, prediction: dict, records_summary: dict, academic_records: list, subjects: list) -> str:
    """Generate a contextual response based on the student's data and question."""
    msg = message.lower().strip()

    # ── Greetings ──
    if any(w in msg for w in ["hi", "hello", "hey", "start", "help"]) and len(msg) < 20:
        return GENERAL_RESPONSES["greeting"]

    # ── About the system ──
    if any(w in msg for w in ["what is insightu", "about", "what does this do", "how does this work", "how it works"]):
        return GENERAL_RESPONSES["how_it_works"]

    # ── Subject-specific queries ──
    if subjects:
        for subj in subjects:
            if subj.lower() in msg:
                return _build_subject_response(subj, academic_records, academic_records)

    if any(w in msg for w in ["subject", "subjects", "my subjects", "courses", "my courses"]):
        if subjects:
            response = "📚 **Your Subjects:**\n\n"
            for subj in subjects:
                subj_scores = [r.score for r in academic_records if r.subject == subj]
                avg = sum(subj_scores) / len(subj_scores) if subj_scores else 0
                emoji = "🟢" if avg >= 75 else "🟡" if avg >= 50 else "🔴"
                response += f"{emoji} **{subj}** — Avg: {avg:.1f} ({len(subj_scores)} records)\n"
            response += "\nAsk me about any specific subject for a detailed breakdown!"
            return response
        return "No subjects recorded yet. Once your faculty uploads academic data, I'll show you all your subjects."

    # ── Resources / Study materials ──
    if any(w in msg for w in ["resource", "material", "notes", "download", "study material", "slides", "find material"]):
        return "📚 Your faculty may have uploaded study materials for you!\n\n**Go to the Resources tab** in your sidebar to browse and download:\n• Lecture notes & slides\n• Practice problems\n• Reference documents\n\nYou can filter by subject to find exactly what you need."

    # ── Why flagged ──
    if any(w in msg for w in ["why", "flagged", "flag", "reason", "why was i"]):
        if not prediction:
            return "No predictions have been generated for you yet. Once your faculty runs the ML pipeline, I'll be able to explain your results."
        summary = prediction.get("summary_text", "")
        flags = prediction.get("flags", [])
        risk = prediction.get("risk_score", 0)
        level = "High Risk 🔴" if risk >= 0.7 else "Medium Risk 🟡" if risk >= 0.4 else "Low Risk 🟢"
        response = f"Your current status is **{level}** (score: {risk:.0%}).\n\n"
        if summary:
            response += f"**AI Explanation:** {summary}\n\n"
        if flags:
            response += "**Active flags:**\n"
            for f in flags:
                response += f"• {f.replace('_', ' ').title()}\n"
            response += "\nAsk me \"How can I improve?\" for specific tips on each flag!"
        return response

    # ── Risk score ──
    if any(w in msg for w in ["risk", "risk score", "my risk", "risk level"]):
        if not prediction:
            return "No risk assessment available yet. Ask your faculty to run predictions."
        risk = prediction.get("risk_score", 0)
        ci = prediction.get("consistency_index", 0)
        level = "High 🔴" if risk >= 0.7 else "Medium 🟡" if risk >= 0.4 else "Low 🟢"
        response = f"**Risk Assessment:**\n\n"
        response += f"• Risk Level: **{level}** ({risk:.0%})\n"
        response += f"• Consistency Index: **{ci:.0f}/100**\n\n"
        flags = prediction.get("flags", [])
        if flags:
            response += "Contributing factors:\n"
            for f in flags:
                response += f"  ⚠️ {f.replace('_', ' ').title()}\n"
        else:
            response += "No specific risk flags detected — keep up the good work! 🌟"
        return response

    # ── How to improve ──
    if any(w in msg for w in ["improve", "better", "fix", "help me", "what can i do", "suggestion", "recommend", "tips"]):
        if not prediction:
            return "No predictions yet! Once your faculty runs predictions, I can give you personalized improvement tips based on your actual data."
        flags = prediction.get("flags", [])
        contributions = prediction.get("feature_contributions", [])
        top_features = [c.get("feature", "") for c in contributions[:3]] if contributions else flags
        response = "Here are personalized tips based on your data:\n\n"
        for feature in top_features:
            tips = IMPROVEMENT_TIPS.get(feature, IMPROVEMENT_TIPS.get("academic_variance", []))
            if tips:
                tip = random.choice(tips)
                response += f"**{feature.replace('_', ' ').title()}:** {tip}\n\n"
        if not top_features:
            response += "Keep up your consistent work! Focus on maintaining your attendance and submitting assignments on time.\n\n"
        response += "💡 Also check the **Resources** tab for study materials from your faculty!"
        return response

    # ── Score / consistency ──
    if any(w in msg for w in ["score", "consistency", "index", "my score", "my consistency"]):
        if not prediction:
            return "Your consistency index hasn't been calculated yet. Ask your faculty to run the ML pipeline."
        ci = prediction.get("consistency_index", 0)
        status = "Excellent! Keep it up! 🌟" if ci >= 75 else "Room for improvement. Focus on the flagged areas." if ci >= 50 else "This needs attention. Let me suggest some improvements."
        return f"Your **Consistency Index** is **{ci:.0f}/100**.\n\n{status}\n\nWant me to suggest ways to improve? Just ask!"

    # ── Attendance ──
    if any(w in msg for w in ["attendance", "absent", "present", "class"]):
        rate = records_summary.get("attendance_rate", 0) if records_summary else 0
        if rate >= 90:
            return f"Your attendance rate is **{rate}%** — great job! 🌟 Consistent attendance is one of the strongest predictors of academic success."
        elif rate >= 75:
            return f"Your attendance is at **{rate}%**. It's decent, but try to push it above 90% for the best impact on your consistency score."
        else:
            return f"Your attendance is at **{rate}%**, which is contributing to your risk score. Try to attend every class this week — even small improvements help.\n\n💡 Tip: Set an alarm 30 minutes before each class."

    # ── Deadlines / delays ──
    if any(w in msg for w in ["deadline", "due", "submit", "late", "delay", "overdue", "assignment"]):
        avg_delay = records_summary.get("avg_delay", 0) if records_summary else 0
        if avg_delay <= 1:
            return f"Your average assignment delay is **{avg_delay} days** — you're very punctual! ✅ Keep submitting on time."
        elif avg_delay <= 3:
            return f"Your average delay is **{avg_delay} days**. Try setting personal deadlines 2 days before the actual due date to build a buffer.\n\n💡 **Tip:** Break large assignments into smaller daily tasks."
        else:
            tips = random.choice(IMPROVEMENT_TIPS.get("assignment_delays", [""]))
            return f"Your average assignment delay is **{avg_delay} days**, which is affecting your consistency score.\n\n**Suggested action:** {tips}\n\n💡 Also try the Pomodoro technique — 25 min work, 5 min break."

    # ── LMS / portal activity ──
    if any(w in msg for w in ["lms", "portal", "login", "inactive", "online", "platform"]):
        avg_inactive = records_summary.get("avg_inactive", 0) if records_summary else 0
        if avg_inactive <= 1:
            return f"You're averaging **{avg_inactive} inactive days** on the LMS — you're very engaged! 🌟 Keep checking in regularly."
        elif avg_inactive <= 3:
            return f"You average **{avg_inactive} inactive days** on the LMS. Try checking in daily, even for 5 minutes.\n\n💡 **Tip:** Enable push notifications from your LMS."
        else:
            tips = random.choice(IMPROVEMENT_TIPS.get("behavioral_inactive_mean", [""]))
            return f"Your LMS inactivity averages **{avg_inactive} days**, which raises flags in the system.\n\n**Action item:** {tips}"

    # ── Strengths ──
    if any(w in msg for w in ["strength", "good at", "best", "positive"]):
        if not prediction:
            return "I'll be able to identify your strengths once predictions are generated."
        contributions = prediction.get("feature_contributions", [])
        positives = [c for c in contributions if c.get("direction") != "negative"]
        if positives:
            response = "Here are your strengths:\n\n"
            for p in positives:
                response += f"✅ **{p['feature'].replace('_', ' ').title()}** — positive contribution\n"
            return response

        # Check subject strengths
        if academic_records:
            all_scores = [r.score for r in academic_records]
            overall_avg = sum(all_scores) / len(all_scores) if all_scores else 0
            strong = []
            for subj in set(r.subject for r in academic_records):
                subj_scores = [r.score for r in academic_records if r.subject == subj]
                subj_avg = sum(subj_scores) / len(subj_scores)
                if subj_avg >= overall_avg:
                    strong.append((subj, subj_avg))
            if strong:
                response = "Your strongest subjects:\n\n"
                for s, avg in sorted(strong, key=lambda x: -x[1]):
                    response += f"🌟 **{s}** — Avg: {avg:.1f}\n"
                return response

        return "Your data shows areas that need attention, but remember — every flag is an opportunity to improve! Focus on the tips I can provide."

    # ── Compare / class average ──
    if any(w in msg for w in ["compare", "class average", "average", "how am i doing", "overall"]):
        if not records_summary:
            return "No records available yet for comparison. Ask your faculty to upload your data."
        avg_score = records_summary.get("avg_score", 0)
        rate = records_summary.get("attendance_rate", 0)
        avg_delay = records_summary.get("avg_delay", 0)
        response = "📊 **Your Academic Profile Summary:**\n\n"
        score_emoji = "🟢" if avg_score >= 75 else "🟡" if avg_score >= 50 else "🔴"
        att_emoji = "🟢" if rate >= 90 else "🟡" if rate >= 75 else "🔴"
        delay_emoji = "🟢" if avg_delay <= 1 else "🟡" if avg_delay <= 3 else "🔴"
        response += f"{score_emoji} Average Score: **{avg_score}**\n"
        response += f"{att_emoji} Attendance Rate: **{rate}%**\n"
        response += f"{delay_emoji} Avg Assignment Delay: **{avg_delay} days**\n"
        if prediction:
            ci = prediction.get("consistency_index", 0)
            response += f"\n📈 Consistency Index: **{ci:.0f}/100**"
        return response

    # ── Thank you ──
    if any(w in msg for w in ["thank", "thanks", "thx", "appreciate"]):
        return "You're welcome! 😊 I'm here whenever you need help. Keep working hard — you've got this! 💪"

    # ── Fallback ──
    return "I can help you with:\n\n• **\"My subjects\"** — see all your subjects with scores\n• **\"What's my Math score?\"** — details on a specific subject\n• **\"Why was I flagged?\"** — understand your risk assessment\n• **\"How can I improve?\"** — personalized tips\n• **\"My risk score\"** — detailed risk breakdown\n• **\"My attendance\"** — check your rate\n• **\"Deadline tips\"** — assignment submission help\n• **\"Find study materials\"** — access faculty resources\n• **\"How am I doing overall?\"** — full profile summary\n\nWhat would you like to know?"


@router.post("/ask")
def ask_chatbot(payload: ChatMessage, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """AI chatbot that answers student questions using their data as context."""
    student = db.query(models.Student).filter(models.Student.user_id == user.id).first()

    prediction_data = None
    records_summary = None
    academic_records = []
    subjects = []

    if student:
        # Get latest prediction
        pred = db.query(models.Prediction).filter(
            models.Prediction.student_id == student.id
        ).order_by(models.Prediction.created_at.desc()).first()

        if pred:
            explanation = db.query(models.Explanation).filter(models.Explanation.prediction_id == pred.id).first()
            prediction_data = {
                "consistency_index": pred.consistency_index,
                "risk_score": pred.risk_score,
                "flags": pred.flags,
                "summary_text": explanation.summary_text if explanation else None,
                "feature_contributions": explanation.feature_json if explanation else [],
            }

        # Get all academic records for subject-specific queries
        academic_records = db.query(models.AcademicRecord).filter(
            models.AcademicRecord.student_id == student.id
        ).order_by(models.AcademicRecord.date).all()

        subjects = sorted(set(r.subject for r in academic_records))

        # Get records summary
        attendance = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.student_id == student.id).all()
        behavioral = db.query(models.BehavioralLog).filter(models.BehavioralLog.student_id == student.id).all()

        records_summary = {
            "avg_score": round(sum(r.score for r in academic_records) / len(academic_records), 1) if academic_records else 0,
            "attendance_rate": round(sum(1 for r in attendance if r.attended) / len(attendance) * 100, 1) if attendance else 0,
            "avg_delay": round(sum(r.assignment_delay_days for r in behavioral) / len(behavioral), 1) if behavioral else 0,
            "avg_inactive": round(sum(r.lms_inactive_days for r in behavioral) / len(behavioral), 1) if behavioral else 0,
        }

    response = _generate_response(payload.message, prediction_data, records_summary, academic_records, subjects)
    return {"response": response}
