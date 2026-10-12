from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from . import models
from .seed_questions import QUESTION_BANK
from .routers import (
    auth_router, subjects_router, learning_style_router,
    quiz_router, study_plan_router, dashboard_router,
)

Base.metadata.create_all(bind=engine)


def seed_quiz_questions():
    db = SessionLocal()
    try:
        existing_count = db.query(models.QuizQuestion).count()
        if existing_count > 0:
            return
        for (subject, question, a, b, c, d, correct, explanation, topic) in QUESTION_BANK:
            db.add(models.QuizQuestion(
                subject=subject, question=question,
                option_a=a, option_b=b, option_c=c, option_d=d,
                correct_option=correct, explanation=explanation, topic=topic,
            ))
        db.commit()
    finally:
        db.close()


seed_quiz_questions()

app = FastAPI(title="Digital Twin of Human Learning Style API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173","https://digital-twin-learning-style-fkhr.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(subjects_router.router)
app.include_router(learning_style_router.router)
app.include_router(quiz_router.router)
app.include_router(study_plan_router.router)
app.include_router(dashboard_router.router)
app.include_router(dashboard_router.twin_router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Digital Twin API is running."}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
