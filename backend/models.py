from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_id = Column(String, unique=True, index=True, nullable=False)
    class_name = Column(String, nullable=False)
    advisor = Column(String, nullable=False)

    students = relationship("Student", back_populates="class_rel")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    birth_year = Column(Integer, nullable=False)
    major = Column(String, nullable=False)
    gpa = Column(Float, nullable=False)
    class_id = Column(String, ForeignKey("classes.class_id"), nullable=True)

    class_rel = relationship("Class", back_populates="students")
