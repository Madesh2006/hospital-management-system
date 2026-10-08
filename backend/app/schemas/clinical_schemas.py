import datetime as dt
from typing import Optional, List
from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_id: int
    department: str
    date: dt.date
    time: dt.time
    reason: Optional[str] = None


class AppointmentOut(BaseModel):
    appointment_id: int
    patient_id: int
    patient_name: Optional[str] = None
    doctor_id: int
    doctor_name: Optional[str] = None
    department: str
    date: dt.date
    time: dt.time
    reason: Optional[str]
    status: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class AppointmentStatusUpdate(BaseModel):
    status: str  # confirmed | rejected | completed | cancelled


class MedicineItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str


class PrescriptionCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    medicines: List[MedicineItem]
    instructions: Optional[str] = None


class PrescriptionOut(BaseModel):
    prescription_id: int
    patient_id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    medicines: List[MedicineItem]
    instructions: Optional[str]
    pdf_path: Optional[str]
    created_at: dt.datetime

    class Config:
        from_attributes = True


class MedicalRecordCreate(BaseModel):
    patient_id: int
    diagnosis: str
    treatment: Optional[str] = None


class MedicalRecordOut(BaseModel):
    record_id: int
    patient_id: int
    doctor_id: Optional[int]
    diagnosis: str
    treatment: Optional[str]
    report_file: Optional[str]
    created_at: dt.datetime

    class Config:
        from_attributes = True
