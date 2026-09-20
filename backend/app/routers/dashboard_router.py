from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, auth
from ..database import get_db
from ..ml import prediction as pred
from ..ml import learning_style as ls

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
twin_router = APIRouter(prefix="/api/digital-twin", tags=["digital-twin"])


def _build_overview(db: Session, user: models.User):
    subjects = db.query(models.Subject).filter(models.Subject.user_id == user.id).all()
    quiz_attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == user.id).all()
    ls_record = db.query(models.LearningStyleResult).filter(
        models.LearningStyleResult.user_id == user.id
    ).first()

    total_study_minutes = 0
    completed = db.query(models.StudyPlanItem).filter(
        models.StudyPlanItem.user_id == user.id, models.StudyPlanItem.completed == True  # noqa: E712
    ).all()
    total_study_minutes = sum(t.duration_minutes for t in completed)

    subject_results = []
    for s in subjects:
        p = pred.predict_subject(s)
        priority = pred.improvement_priority(p["current_percentage"], p["trend"])
        subject_results.append({"name": s.name, "priority": priority, **p})

    overall_percentage = (
        round(sum(r["current_percentage"] for r in subject_results) / len(subject_results), 2)
        if subject_results else 0
    )

    weak = sorted([r for r in subject_results if r["priority"] in ("High", "Medium")], key=lambda r: r["current_percentage"])[:5]
    strong = sorted([r for r in subject_results if r["priority"] == "Low"], key=lambda r: -r["current_percentage"])[:5]

    style_info = None
    if ls_record:
        style_key = [k for k, v in ls.STYLE_LABELS.items() if v == ls_record.style][0]
        style_info = {"style": ls_record.style, "style_key": style_key}

    return {
        "student_name": user.full_name,
        "total_subjects": len(subjects),
        "quizzes_taken": len(quiz_attempts),
        "total_study_time_hours": round(total_study_minutes / 60, 1),
        "overall_progress": overall_percentage,
        "subject_performance": [
            {"subject": r["name"], "percentage": r["current_percentage"]} for r in subject_results
        ],
        "weak_subjects": weak,
        "strong_subjects": strong,
        "learning_style": style_info,
        "has_subject_data": len(subjects) > 0,
        "has_learning_style": ls_record is not None,
        "next_suggested_step": _next_step(subjects, ls_record, quiz_attempts, weak),
    }


def _next_step(subjects, ls_record, quiz_attempts, weak):
    if not ls_record:
        return "Complete your Learning Style Assessment to unlock personalized tips."
    if not subjects:
        return "Add your subjects and enter marks to see your performance analysis."
    if weak:
        top = weak[0]
        return f"Revise {top['name']} — practice a few questions and review the topic."
    if not quiz_attempts:
        return "Take a quiz to test your understanding and update your Digital Twin."
    return "Keep up the good work — check your Study Planner for today's tasks."


@router.get("")
def dashboard_overview(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return _build_overview(db, current_user)


@twin_router.get("")
def digital_twin(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    overview = _build_overview(db, current_user)
    ls_record = db.query(models.LearningStyleResult).filter(
        models.LearningStyleResult.user_id == current_user.id
    ).first()

    tips = []
    style_key = None
    if ls_record:
        style_key = [k for k, v in ls.STYLE_LABELS.items() if v == ls_record.style][0]
        tips = ls.STYLE_TIPS[style_key]

    quiz_avg = None
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == current_user.id).all()
    if attempts:
        quiz_avg = round(sum(a.score_percentage for a in attempts) / len(attempts), 2)

    return {
        "profile": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "roll_number": current_user.roll_number,
            "college_name": current_user.college_name,
            "branch": current_user.branch,
            "academic_year": current_user.academic_year,
        },
        "learning_style": ls_record.style if ls_record else None,
        "learning_style_tips": tips,
        "strong_areas": [s["name"] for s in overview["strong_subjects"]],
        "weak_areas": [s["name"] for s in overview["weak_subjects"]],
        "current_performance": overview["overall_progress"],
        "quiz_average": quiz_avg,
        "study_preferences": {
            "preferred_time": current_user.preferred_study_time,
            "daily_study_time": current_user.daily_study_time,
            "goals": current_user.goals,
        },
        "top_recommendation": overview["next_suggested_step"],
        "has_subject_data": overview["has_subject_data"],
        "has_learning_style": overview["has_learning_style"],
    }
