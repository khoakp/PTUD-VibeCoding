from sqlalchemy.orm import Session
from models import Student
from schemas import StudentCreate, StudentUpdate


def get_students(db: Session):
    return db.query(Student).all()


def get_student(db: Session, student_id: str):
    return db.query(Student).filter(Student.student_id == student_id).first()


def create_student(db: Session, student: StudentCreate):
    db_student = Student(
        student_id=student.student_id,
        name=student.name,
        birth_year=student.birth_year,
        major=student.major,
        gpa=student.gpa,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: str, student: StudentUpdate):
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student is None:
        return None
    db_student.name = student.name
    db_student.birth_year = student.birth_year
    db_student.major = student.major
    db_student.gpa = student.gpa
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: str):
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student is None:
        return False
    db.delete(db_student)
    db.commit()
    return True
