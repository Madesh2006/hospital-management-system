from typing import Optional
from pydantic import BaseModel, EmailStr


class PatientProfileOut(BaseModel):
    patient_id: int
    name: str
    email: EmailStr
    age: Optional[int]
    gender: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    blood_group: Optional[str]
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class PatientProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None


class DoctorProfileOut(BaseModel):
    doctor_id: int
    name: str
    email: EmailStr
    specialization: str
    department: str
    qualification: Optional[str]
    experience: Optional[int]
    consultation_fee: Optional[int]
    availability: Optional[str]
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class DoctorProfileUpdate(BaseModel):
    name: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[int] = None
    availability: Optional[str] = None  # JSON string, e.g. {"Mon": ["09:00-12:00"]}


class DoctorPublicOut(BaseModel):
    """What patients see when browsing/searching doctors."""
    doctor_id: int
    name: str
    specialization: str
    department: str
    qualification: Optional[str]
    experience: Optional[int]
    consultation_fee: Optional[int]
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True
