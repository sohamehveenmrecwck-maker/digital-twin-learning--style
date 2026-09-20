from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    academic_year = Column(String, default="")
    branch = Column(String, default="")
    college_name = Column(String, default="")
    preferred_study_time = Column(String, default="Evening (6 PM - 10 PM)")
    daily_study_time = Column(String, default="2 hours")
    goals = Column(String, default="Improve overall academic performance")
    created_at = Column(DateTime, default=datetime.utcnow)

    subjects = relationship("Subject", back_populates="owner", cascade="all, delete-orphan")
    learning_style = relationship("LearningStyleResult", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="owner", cascade="all, delete-orphan")
    study_plan_items = relationship("StudyPlanItem", back_populates="owner", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    internal_marks = Column(Float, default=0)      # out of 20
    assignment_marks = Column(Float, default=0)     # out of 10
    mid_exam_marks = Column(Float, default=0)       # out of 20
    previous_semester_marks = Column(Float, default=0)  # percentage 0-100
    current_marks = Column(Float, default=0)        # out of 50 (end sem / current assessment)
    total_marks = Column(Float, default=100)        # max total marks
    attendance = Column(Float, default=0)           # percentage, optional
    topics_completed = Column(Integer, default=0)
    topics_total = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="subjects")


class LearningStyleResult(Base):
    __tablename__ = "learning_style_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    style = Column(String, nullable=False)   # Visual / Auditory / Reading-Writing / Kinesthetic
    visual_score = Column(Integer, default=0)
    auditory_score = Column(Integer, default=0)
    reading_score = Column(Integer, default=0)
    kinesthetic_score = Column(Integer, default=0)
    answers_json = Column(Text, default="{}")
    completed_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="learning_style")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True, nullable=False)
    question = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False)  # 'a' | 'b' | 'c' | 'd'
    explanation = Column(Text, default="")
    topic = Column(String, default="General")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String, nullable=False)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    score_percentage = Column(Float, default=0)
    weak_topics_json = Column(Text, default="[]")
    taken_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="quiz_attempts")


class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(String, nullable=False)   # Monday, Tuesday, ...
    subject = Column(String, nullable=False)
    task = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=60)
    completed = Column(Boolean, default=False)
    week_start = Column(String, default="")  # ISO date string identifying the week
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="study_plan_items")
