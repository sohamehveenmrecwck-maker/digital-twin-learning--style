from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ---------- Auth ----------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    roll_number: str
    password: str
    confirm_password: str
    academic_year: str
    branch: str
    college_name: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    identifier: str  # email or roll number
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    roll_number: str
    academic_year: str
    branch: str
    college_name: str
    preferred_study_time: str
    daily_study_time: str
    goals: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    academic_year: Optional[str] = None
    branch: Optional[str] = None
    college_name: Optional[str] = None
    preferred_study_time: Optional[str] = None
    daily_study_time: Optional[str] = None
    goals: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ---------- Subjects ----------
class SubjectCreate(BaseModel):
    name: str
    internal_marks: float = 0
    assignment_marks: float = 0
    mid_exam_marks: float = 0
    previous_semester_marks: float = 0
    current_marks: float = 0
    total_marks: float = 100
    attendance: float = 0
    topics_completed: int = 0
    topics_total: int = 5

    @field_validator("internal_marks", "assignment_marks", "mid_exam_marks", "current_marks")
    @classmethod
    def not_negative(cls, v):
        if v < 0:
            raise ValueError("Marks cannot be negative")
        return v


class SubjectUpdate(SubjectCreate):
    pass


class SubjectOut(SubjectCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ---------- Learning Style ----------
class LearningStyleSubmit(BaseModel):
    answers: List[str]  # list of 'visual' | 'auditory' | 'reading' | 'kinesthetic'


class LearningStyleOut(BaseModel):
    style: str
    visual_score: int
    auditory_score: int
    reading_score: int
    kinesthetic_score: int
    completed_at: datetime

    class Config:
        from_attributes = True


# ---------- Quiz ----------
class QuizQuestionOut(BaseModel):
    id: int
    subject: str
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    topic: str

    class Config:
        from_attributes = True


class QuizAnswerIn(BaseModel):
    question_id: int
    selected_option: str


class QuizSubmit(BaseModel):
    subject: str
    answers: List[QuizAnswerIn]


class QuizResultOut(BaseModel):
    subject: str
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score_percentage: float
    weak_topics: List[str]
    details: List[dict]


class QuizAttemptOut(BaseModel):
    id: int
    subject: str
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score_percentage: float
    taken_at: datetime

    class Config:
        from_attributes = True


# ---------- Study Plan ----------
class StudyPlanItemOut(BaseModel):
    id: int
    day_of_week: str
    subject: str
    task: str
    duration_minutes: int
    completed: bool

    class Config:
        from_attributes = True


class StudyPlanToggle(BaseModel):
    completed: bool
