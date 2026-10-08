import datetime as dt

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    prescription_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=True)
    medicines = Column(Text, nullable=False)     # JSON string: [{name, dosage, frequency, duration}]
    instructions = Column(Text, nullable=True)
    pdf_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    record_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=True)
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text, nullable=True)
    report_file = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    patient = relationship("Patient", back_populates="medical_records")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
