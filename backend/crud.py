from sqlalchemy import func
from sqlalchemy.orm import Session
from models import Student, Class
from schemas import StudentCreate, StudentUpdate, ClassCreate, ClassUpdate


# ─── Student CRUD ─────────────────────────────────────────────────────────────


def get_students(db: Session, search: str = None):
    query = db.query(Student)
    if search:
        query = query.filter(Student.name.ilike(f"%{search}%"))
    return query.all()


def get_student(db: Session, student_id: str):
    return db.query(Student).filter(Student.student_id == student_id).first()


def create_student(db: Session, student: StudentCreate):
    db_student = Student(
        student_id=student.student_id,
        name=student.name,
        birth_year=student.birth_year,
        major=student.major,
        gpa=student.gpa,
        class_id=student.class_id,
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
    db_student.class_id = student.class_id
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


# ─── Class CRUD ───────────────────────────────────────────────────────────────


def get_classes(db: Session):
    return db.query(Class).all()


def get_class(db: Session, class_id: str):
    return db.query(Class).filter(Class.class_id == class_id).first()


def create_class(db: Session, cls: ClassCreate):
    db_class = Class(
        class_id=cls.class_id,
        class_name=cls.class_name,
        advisor=cls.advisor,
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


def update_class(db: Session, class_id: str, cls: ClassUpdate):
    db_class = db.query(Class).filter(Class.class_id == class_id).first()
    if db_class is None:
        return None
    db_class.class_name = cls.class_name
    db_class.advisor = cls.advisor
    db.commit()
    db.refresh(db_class)
    return db_class


def delete_class(db: Session, class_id: str):
    db_class = db.query(Class).filter(Class.class_id == class_id).first()
    if db_class is None:
        return False
    db.delete(db_class)
    db.commit()
    return True


# ─── Statistics ───────────────────────────────────────────────────────────────


def get_statistics(db: Session):
    total = db.query(func.count(Student.id)).scalar()
    avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0.0
    by_major = (
        db.query(Student.major, func.count(Student.id))
        .group_by(Student.major)
        .all()
    )
    return {
        "total_students": total,
        "average_gpa": round(float(avg_gpa), 2),
        "students_by_major": [{"major": m, "count": c} for m, c in by_major],
    }
