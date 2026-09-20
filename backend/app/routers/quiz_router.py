import json
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

SUBJECTS = [
    "DBMS", "Computer Networks", "Artificial Intelligence",
    "Cloud Computing", "Compiler Design", "Deep Learning",
]


@router.get("/subjects")
def list_quiz_subjects():
    return SUBJECTS


@router.get("/questions/{subject}", response_model=list[schemas.QuizQuestionOut])
def get_questions(subject: str, db: Session = Depends(get_db)):
    questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.subject == subject).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this subject yet.")
    random.shuffle(questions)
    return questions


@router.post("/submit", response_model=schemas.QuizResultOut)
def submit_quiz(
    payload: schemas.QuizSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not payload.answers:
        raise HTTPException(status_code=400, detail="No answers submitted.")

    question_ids = [a.question_id for a in payload.answers]
    questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.id.in_(question_ids)).all()
    q_map = {q.id: q for q in questions}

    correct = 0
    wrong = 0
    details = []
    weak_topics = set()

    for a in payload.answers:
        q = q_map.get(a.question_id)
        if not q:
            continue
        is_correct = a.selected_option.lower() == q.correct_option.lower()
        if is_correct:
            correct += 1
        else:
            wrong += 1
            weak_topics.add(q.topic)
        details.append({
            "question_id": q.id,
            "question": q.question,
            "selected_option": a.selected_option,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "topic": q.topic,
        })

    total = correct + wrong
    score_pct = round((correct / total) * 100, 2) if total else 0

    attempt = models.QuizAttempt(
        user_id=current_user.id,
        subject=payload.subject,
        total_questions=total,
        correct_answers=correct,
        wrong_answers=wrong,
        score_percentage=score_pct,
        weak_topics_json=json.dumps(list(weak_topics)),
    )
    db.add(attempt)
    db.commit()

    return {
        "subject": payload.subject,
        "total_questions": total,
        "correct_answers": correct,
        "wrong_answers": wrong,
        "score_percentage": score_pct,
        "weak_topics": list(weak_topics),
        "details": details,
    }


@router.get("/history", response_model=list[schemas.QuizAttemptOut])
def quiz_history(
    db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)
):
    return (
        db.query(models.QuizAttempt)
        .filter(models.QuizAttempt.user_id == current_user.id)
        .order_by(models.QuizAttempt.taken_at.desc())
        .all()
    )
