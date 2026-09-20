from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..ml import prediction as pred

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


def _validate_marks(payload: schemas.SubjectCreate):
    component_max = {"internal_marks": 20, "assignment_marks": 10, "mid_exam_marks": 20, "current_marks": 50}
    for field, cap in component_max.items():
        val = getattr(payload, field)
        if val > cap:
            raise HTTPException(status_code=400, detail=f"{field.replace('_', ' ').title()} cannot exceed {cap}.")
    if payload.previous_semester_marks > 100:
        raise HTTPException(status_code=400, detail="Previous semester marks cannot exceed 100%.")
    if payload.attendance > 100:
        raise HTTPException(status_code=400, detail="Attendance cannot exceed 100%.")


@router.get("", response_model=list[schemas.SubjectOut])
def list_subjects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Subject).filter(models.Subject.user_id == current_user.id).all()


@router.post("", response_model=schemas.SubjectOut)
def create_subject(
    payload: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    _validate_marks(payload)
    subject = models.Subject(user_id=current_user.id, **payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.put("/{subject_id}", response_model=schemas.SubjectOut)
def update_subject(
    subject_id: int,
    payload: schemas.SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    subject = db.query(models.Subject).filter(
        models.Subject.id == subject_id, models.Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    _validate_marks(payload)
    for field, value in payload.model_dump().items():
        setattr(subject, field, value)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    subject = db.query(models.Subject).filter(
        models.Subject.id == subject_id, models.Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    db.delete(subject)
    db.commit()
    return {"detail": "Subject deleted."}


@router.get("/analysis/prediction")
def performance_analysis(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    """Full academic performance analysis + prediction + weak subject ranking."""
    subjects = db.query(models.Subject).filter(models.Subject.user_id == current_user.id).all()
    if not subjects:
        return {
            "has_data": False,
            "message": "Enter your subject marks to view your performance analytics.",
        }

    subject_results = []
    percentages = []
    for s in subjects:
        p = pred.predict_subject(s)
        priority = pred.improvement_priority(p["current_percentage"], p["trend"])
        subject_results.append({
            "subject_id": s.id,
            "subject_name": s.name,
            **p,
            "improvement_priority": priority,
            "suggested_topics": pred.suggested_topics_for(s.name),
            "recommended_study_minutes": pred.recommended_study_minutes(priority),
            "attendance": s.attendance,
        })
        percentages.append(p["current_percentage"])

    overall_percentage = round(sum(percentages) / len(percentages), 2)

    history_available = [r for r in subject_results if r["previous_percentage"] is not None]
    if history_available:
        overall_predicted = round(
            sum(r["predicted_percentage"] for r in history_available) / len(history_available), 2
        )
        overall_prev = round(
            sum(r["previous_percentage"] for r in history_available) / len(history_available), 2
        )
        overall_trend = "Improving" if overall_percentage > overall_prev + 2 else (
            "Declining" if overall_percentage < overall_prev - 2 else "Stable"
        )
        overall_confidence = "Moderate" if len(history_available) >= max(2, len(subjects) // 2) else "Limited — based on available marks."
    else:
        overall_predicted = None
        overall_trend = "Not enough data"
        overall_confidence = "Low"

    weak_subjects = sorted(
        [r for r in subject_results if r["improvement_priority"] in ("High", "Medium")],
        key=lambda r: r["current_percentage"],
    )
    strong_subjects = sorted(
        [r for r in subject_results if r["improvement_priority"] == "Low"],
        key=lambda r: -r["current_percentage"],
    )

    return {
        "has_data": True,
        "overall_percentage": overall_percentage,
        "overall_predicted_percentage": overall_predicted,
        "overall_trend": overall_trend,
        "overall_confidence": overall_confidence,
        "subjects": subject_results,
        "weak_subjects": weak_subjects,
        "strong_subjects": strong_subjects,
        "note": "Predictions are estimates only, based on the marks you entered — not guaranteed outcomes.",
    }
