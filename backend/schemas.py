from pydantic import BaseModel, Field


class StudentCreate(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float = Field(ge=0, le=4)


class StudentUpdate(BaseModel):
    name: str
    birth_year: int
    major: str
    gpa: float = Field(ge=0, le=4)


class StudentResponse(BaseModel):
    id: int
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float

    model_config = {"from_attributes": True}
