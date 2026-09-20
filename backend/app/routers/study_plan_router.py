from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..ml import prediction as pred

router = APIRouter(prefix="/api/study-plan", tags=["study-plan"])

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _week_start_str() -> str:
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    return monday.isoformat()


def _generate_tasks_for_user(db: Session, user: models.User):
    subjects = db.query(models.Subject).filter(models.Subject.user_id == user.id).all()
    ls_record = db.query(models.LearningStyleResult).filter(
        models.LearningStyleResult.user_id == user.id
    ).first()

    if not subjects:
        return []

    ranked = []
    for s in subjects:
        p = pred.predict_subject(s)
        priority = pred.improvement_priority(p["current_percentage"], p["trend"])
        weight = {"High": 3, "Medium": 2, "Low": 1}[priority]
        ranked.append((s, priority, weight, p["current_percentage"]))

    # Sort weakest first so they get the most days/slots
    ranked.sort(key=lambda r: r[3])

    # Build a rotation: weighted round-robin across the week
    slots = []
    for s, priority, weight, _ in ranked:
        slots.extend([s] * weight)
    if not slots:
        return []

    # style-based task phrasing
    style_key = None
    if ls_record:
        scores = {
            "visual": ls_record.visual_score, "auditory": ls_record.auditory_score,
            "reading": ls_record.reading_score, "kinesthetic": ls_record.kinesthetic_score,
        }
        style_key = max(scores, key=scores.get)

    style_task_verbs = {
        "visual": "Watch a concept video / draw a diagram on",
        "auditory": "Explain aloud / discuss",
        "reading": "Read notes and summarize",
        "kinesthetic": "Practice problems / hands-on exercise on",
        None: "Study",
    }
    verb = style_task_verbs.get(style_key, "Study")

    tasks = []
    slot_idx = 0
    week_start = _week_start_str()
    for day in DAYS:
        # 2 tasks per day, cycling through the weighted subject slots
        for _ in range(2):
            if slot_idx >= len(slots) * 3:  # cap total generated tasks
                break
            subject = slots[slot_idx % len(slots)]
            topics = pred.suggested_topics_for(subject.name)
            topic = topics[slot_idx % len(topics)]
            priority = next(p for s, p, w, pc in ranked if s.id == subject.id)
            duration = pred.recommended_study_minutes(priority)
            tasks.append(models.StudyPlanItem(
                user_id=user.id,
                day_of_week=day,
                subject=subject.name,
                task=f"{verb} {topic}",
                duration_minutes=duration,
                week_start=week_start,
            ))
            slot_idx += 1
    return tasks


@router.get("", response_model=list[schemas.StudyPlanItemOut])
def get_plan(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    week_start = _week_start_str()
    items = db.query(models.StudyPlanItem).filter(
        models.StudyPlanItem.user_id == current_user.id,
        models.StudyPlanItem.week_start == week_start,
    ).all()
    return items


@router.post("/generate", response_model=list[schemas.StudyPlanItemOut])
def generate_plan(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    week_start = _week_start_str()
    # Clear this week's existing auto-generated plan and regenerate
    db.query(models.StudyPlanItem).filter(
        models.StudyPlanItem.user_id == current_user.id,
        models.StudyPlanItem.week_start == week_start,
    ).delete()
    db.commit()

    tasks = _generate_tasks_for_user(db, current_user)
    for t in tasks:
        db.add(t)
    db.commit()

    items = db.query(models.StudyPlanItem).filter(
        models.StudyPlanItem.user_id == current_user.id,
        models.StudyPlanItem.week_start == week_start,
    ).all()
    return items


@router.patch("/{item_id}", response_model=schemas.StudyPlanItemOut)
def toggle_task(
    item_id: int,
    payload: schemas.StudyPlanToggle,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    item = db.query(models.StudyPlanItem).filter(
        models.StudyPlanItem.id == item_id, models.StudyPlanItem.user_id == current_user.id
    ).first()
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found.")
    item.completed = payload.completed
    db.commit()
    db.refresh(item)
    return item
