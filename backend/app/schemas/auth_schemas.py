import datetime as dt
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class PatientRegister(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None


class DoctorRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    specialization: str
    department: str
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str  # "patient" | "doctor" | "admin"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    role: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=100)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    profile_image: Optional[str] = None
    created_at: dt.datetime

    class Config:
        from_attributes = True
