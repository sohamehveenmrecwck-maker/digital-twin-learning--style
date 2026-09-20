"""
Simple, explainable academic performance prediction.

No black-box ML here on purpose -- this is designed so a student can explain
exactly how the numbers were produced in a viva/demo.

Approach:
1. Compute the subject's current percentage from entered marks.
2. If a previous semester percentage is available, compute a weighted
   average between previous and current performance (60% current, 40%
   previous) as a simple trend-aware estimate -- this is the
   "weighted average" method mentioned in the project brief.
3. If there isn't enough historical data (no previous marks and no quiz
   history), we do NOT fabricate a confident prediction -- we say so
   explicitly, as required.
4. Trend is derived by comparing current vs previous percentage.
"""
from typing import Optional


def subject_current_percentage(subject) -> float:
    """Current percentage = sum of entered components / total_marks (or the
    max possible for the components that were actually filled in)."""
    max_component_total = 20 + 10 + 20 + 50  # internal + assignment + mid + current
    earned = (
        (subject.internal_marks or 0)
        + (subject.assignment_marks or 0)
        + (subject.mid_exam_marks or 0)
        + (subject.current_marks or 0)
    )
    total = subject.total_marks if subject.total_marks and subject.total_marks > 0 else max_component_total
    pct = (earned / total) * 100
    return round(max(0, min(100, pct)), 2)


def predict_subject(subject) -> dict:
    current_pct = subject_current_percentage(subject)
    previous_pct = subject.previous_semester_marks or None

    has_history = previous_pct is not None and previous_pct > 0

    if not has_history:
        return {
            "current_percentage": current_pct,
            "previous_percentage": None,
            "predicted_percentage": None,
            "trend": "Not enough data",
            "confidence": "Low",
            "note": "More academic data is needed for a reliable prediction.",
        }

    # Weighted average: 60% weight on current performance, 40% on previous.
    # This favours recent performance while still respecting history.
    weighted = round(0.6 * current_pct + 0.4 * previous_pct, 2)

    # A very simple linear extrapolation of the trend (delta) applied
    # forward by half the observed change -- kept deliberately modest so
    # we never claim more certainty than the data supports.
    delta = current_pct - previous_pct
    predicted = round(min(100, max(0, weighted + delta * 0.25)), 2)

    if delta > 2:
        trend = "Improving"
    elif delta < -2:
        trend = "Declining"
    else:
        trend = "Stable"

    confidence = "Moderate" if abs(delta) < 25 else "Limited"

    return {
        "current_percentage": current_pct,
        "previous_percentage": previous_pct,
        "predicted_percentage": predicted,
        "trend": trend,
        "confidence": confidence,
        "note": "Estimate only, based on the marks you entered.",
    }


def improvement_priority(current_pct: float, trend: str) -> str:
    """Explainable rule-based priority, not a black box."""
    if current_pct < 50:
        return "High"
    if current_pct < 65:
        return "Medium" if trend != "Declining" else "High"
    if current_pct < 75 and trend == "Declining":
        return "Medium"
    return "Low"


SUBJECT_TOPIC_SUGGESTIONS = {
    "dbms": ["Normalization", "SQL joins & subqueries", "Transactions & ACID properties", "Indexing"],
    "computer networks": ["OSI & TCP/IP model", "Routing algorithms", "Congestion control", "Subnetting"],
    "artificial intelligence": ["Search algorithms (BFS/DFS/A*)", "Knowledge representation", "Machine learning basics", "Neural network fundamentals"],
    "cloud computing": ["Virtualization concepts", "Service models (IaaS/PaaS/SaaS)", "Cloud deployment models", "Cloud security basics"],
    "compiler design": ["Lexical analysis", "Parsing techniques", "Syntax-directed translation", "Code optimization"],
    "deep learning": ["Neural network basics", "Backpropagation", "CNNs", "Activation functions & loss functions"],
}


def suggested_topics_for(subject_name: str):
    key = subject_name.strip().lower()
    if key in SUBJECT_TOPIC_SUGGESTIONS:
        return SUBJECT_TOPIC_SUGGESTIONS[key]
    return [
        f"Revise {subject_name} fundamentals",
        f"Practice important {subject_name} problems",
        f"Take a short {subject_name} quiz",
        "Review incorrect answers from past attempts",
    ]


def recommended_study_minutes(priority: str) -> int:
    return {"High": 90, "Medium": 60, "Low": 30}.get(priority, 45)
