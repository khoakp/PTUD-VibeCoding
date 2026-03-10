from typing import Optional
from pydantic import BaseModel, Field


# ─── Class Schemas ────────────────────────────────────────────────────────────

class ClassCreate(BaseModel):
    class_id: str
    class_name: str
    advisor: str


class ClassUpdate(BaseModel):
    class_name: str
    advisor: str


class ClassResponse(BaseModel):
    id: int
    class_id: str
    class_name: str
    advisor: str

    model_config = {"from_attributes": True}


# ─── Student Schemas ──────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float = Field(ge=0, le=4)
    class_id: Optional[str] = None


class StudentUpdate(BaseModel):
    name: str
    birth_year: int
    major: str
    gpa: float = Field(ge=0, le=4)
    class_id: Optional[str] = None


class StudentResponse(BaseModel):
    id: int
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float
    class_id: Optional[str] = None
    class_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Statistics Schemas ───────────────────────────────────────────────────────

class MajorCount(BaseModel):
    major: str
    count: int


class StatisticsResponse(BaseModel):
    total_students: int
    average_gpa: float
    students_by_major: list[MajorCount]
