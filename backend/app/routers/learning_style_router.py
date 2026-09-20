import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..ml import learning_style as ls

router = APIRouter(prefix="/api/learning-style", tags=["learning-style"])


@router.get("/questions")
def get_questions():
    return ls.QUESTIONS


@router.post("/submit")
def submit_assessment(
    payload: schemas.LearningStyleSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    result = ls.score_answers(payload.answers)
    scores = result["scores"]
    style_key = result["style_key"]

    existing = db.query(models.LearningStyleResult).filter(
        models.LearningStyleResult.user_id == current_user.id
    ).first()

    if existing:
        existing.style = result["style_label"]
        existing.visual_score = scores["visual"]
        existing.auditory_score = scores["auditory"]
        existing.reading_score = scores["reading"]
        existing.kinesthetic_score = scores["kinesthetic"]
        existing.answers_json = json.dumps(payload.answers)
        record = existing
    else:
        record = models.LearningStyleResult(
            user_id=current_user.id,
            style=result["style_label"],
            visual_score=scores["visual"],
            auditory_score=scores["auditory"],
            reading_score=scores["reading"],
            kinesthetic_score=scores["kinesthetic"],
            answers_json=json.dumps(payload.answers),
        )
        db.add(record)

    db.commit()
    db.refresh(record)

    return {
        "style": record.style,
        "style_key": style_key,
        "scores": scores,
        "explanation": ls.STYLE_EXPLANATIONS[style_key],
        "tips": ls.STYLE_TIPS[style_key],
        "revision_techniques": ls.STYLE_REVISION_TECHNIQUES[style_key],
    }


@router.get("/result")
def get_result(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    record = db.query(models.LearningStyleResult).filter(
        models.LearningStyleResult.user_id == current_user.id
    ).first()
    if not record:
        return {"completed": False}

    style_key = [k for k, v in ls.STYLE_LABELS.items() if v == record.style][0]
    return {
        "completed": True,
        "style": record.style,
        "style_key": style_key,
        "scores": {
            "visual": record.visual_score,
            "auditory": record.auditory_score,
            "reading": record.reading_score,
            "kinesthetic": record.kinesthetic_score,
        },
        "explanation": ls.STYLE_EXPLANATIONS[style_key],
        "tips": ls.STYLE_TIPS[style_key],
        "revision_techniques": ls.STYLE_REVISION_TECHNIQUES[style_key],
    }
