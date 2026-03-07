import csv
import os
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Student
from schemas import StudentCreate, StudentUpdate, StudentResponse
import crud


def import_sample_data(db: Session):
    """Import sample data from CSV file if the database is empty."""
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
            )
            db.add(student)
        db.commit()
    print("Sample data imported successfully.")


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


# ─── API Endpoints ───────────────────────────────────────────────────────────


@app.get("/api/students", response_model=List[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    return crud.get_students(db)


@app.get("/api/students/{student_id}", response_model=StudentResponse)
def read_student(student_id: str, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/api/students", response_model=StudentResponse, status_code=201)
def add_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing = crud.get_student(db, student.student_id)
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    return crud.create_student(db, student)


@app.put("/api/students/{student_id}", response_model=StudentResponse)
def edit_student(student_id: str, student: StudentUpdate, db: Session = Depends(get_db)):
    updated = crud.update_student(db, student_id, student)
    if updated is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return updated


@app.delete("/api/students/{student_id}")
def remove_student(student_id: str, db: Session = Depends(get_db)):
    success = crud.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}
