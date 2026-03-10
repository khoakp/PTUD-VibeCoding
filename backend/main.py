import csv
import io
import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Student, Class
from schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    ClassCreate, ClassUpdate, ClassResponse,
    StatisticsResponse,
)
import crud


SAMPLE_CLASSES = [
    {"class_id": "CLS001", "class_name": "Computer Science 2023", "advisor": "Dr. Nguyen Van Minh"},
    {"class_id": "CLS002", "class_name": "Information Technology 2023", "advisor": "Dr. Tran Thi Hoa"},
    {"class_id": "CLS003", "class_name": "Software Engineering 2023", "advisor": "Dr. Le Quoc Bao"},
    {"class_id": "CLS004", "class_name": "Data Science & AI 2023", "advisor": "Dr. Pham Thanh Tung"},
]


def import_sample_data(db: Session):
    """Import sample data from CSV file if the database is empty."""
    # Seed classes first
    if db.query(Class).count() == 0:
        for c in SAMPLE_CLASSES:
            db.add(Class(**c))
        db.commit()
        print("Sample classes imported successfully.")

    count = db.query(Student).count()
    if count > 0:
        return

    csv_path = os.path.join(os.path.dirname(__file__), "sample_data.csv")
    if not os.path.exists(csv_path):
        print("sample_data.csv not found, skipping import.")
        return

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            student = Student(
                student_id=row["student_id"],
                name=row["name"],
                birth_year=int(row["birth_year"]),
                major=row["major"],
                gpa=float(row["gpa"]),
                class_id=row.get("class_id") or None,
            )
            db.add(student)
        db.commit()
    print("Sample student data imported successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and import sample data
    Base.metadata.create_all(bind=engine)
    from database import SessionLocal
    db = SessionLocal()
    try:
        import_sample_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Student Management API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Student Endpoints ────────────────────────────────────────────────────────


def _student_response(student: Student) -> dict:
    """Build StudentResponse with class_name from the relationship."""
    return StudentResponse(
        id=student.id,
        student_id=student.student_id,
        name=student.name,
        birth_year=student.birth_year,
        major=student.major,
        gpa=student.gpa,
        class_id=student.class_id,
        class_name=student.class_rel.class_name if student.class_rel else None,
    )


@app.get("/api/students/export")
def export_students_csv(db: Session = Depends(get_db)):
    students = crud.get_students(db)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["student_id", "name", "birth_year", "major", "gpa", "class_id", "class_name"])
    for s in students:
        class_name = s.class_rel.class_name if s.class_rel else ""
        writer.writerow([s.student_id, s.name, s.birth_year, s.major, s.gpa, s.class_id or "", class_name])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students.csv"},
    )


@app.get("/api/students", response_model=List[StudentResponse])
def list_students(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    students = crud.get_students(db, search=search)
    return [_student_response(s) for s in students]


@app.get("/api/students/{student_id}", response_model=StudentResponse)
def read_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return _student_response(student)


@app.post("/api/students", response_model=StudentResponse, status_code=201)
def add_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing = crud.get_student(db, student.student_id)
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    created = crud.create_student(db, student)
    return _student_response(created)


@app.put("/api/students/{student_id}", response_model=StudentResponse)
def edit_student(student_id: str, student: StudentUpdate, db: Session = Depends(get_db)):
    updated = crud.update_student(db, student_id, student)
    if updated is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return _student_response(updated)


@app.delete("/api/students/{student_id}")
def remove_student(student_id: str, db: Session = Depends(get_db)):
    success = crud.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}


# ─── Class Endpoints ─────────────────────────────────────────────────────────


@app.get("/api/classes", response_model=List[ClassResponse])
def list_classes(db: Session = Depends(get_db)):
    return crud.get_classes(db)


@app.get("/api/classes/{class_id}", response_model=ClassResponse)
def read_class(class_id: str, db: Session = Depends(get_db)):
    cls = crud.get_class(db, class_id)
    if cls is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls


@app.post("/api/classes", response_model=ClassResponse, status_code=201)
def add_class(cls: ClassCreate, db: Session = Depends(get_db)):
    existing = crud.get_class(db, cls.class_id)
    if existing:
        raise HTTPException(status_code=400, detail="Class ID already exists")
    return crud.create_class(db, cls)


@app.put("/api/classes/{class_id}", response_model=ClassResponse)
def edit_class(class_id: str, cls: ClassUpdate, db: Session = Depends(get_db)):
    updated = crud.update_class(db, class_id, cls)
    if updated is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return updated


@app.delete("/api/classes/{class_id}")
def remove_class(class_id: str, db: Session = Depends(get_db)):
    success = crud.delete_class(db, class_id)
    if not success:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted successfully"}


# ─── Statistics Endpoint ──────────────────────────────────────────────────────


@app.get("/api/statistics", response_model=StatisticsResponse)
def statistics(db: Session = Depends(get_db)):
    return crud.get_statistics(db)
