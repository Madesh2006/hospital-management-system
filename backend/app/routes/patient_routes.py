import json
import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, Patient, Doctor
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical import Prescription, MedicalRecord
from app.schemas.profile_schemas import PatientProfileOut, PatientProfileUpdate, DoctorPublicOut
from app.schemas.clinical_schemas import (
    AppointmentCreate, AppointmentOut, PrescriptionOut, MedicalRecordOut,
)
from app.utils.dependencies import require_patient
from app.config import settings

router = APIRouter(prefix="/api/patient", tags=["Patient"])


def _get_patient_or_404(db: Session, user: User) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient


@router.get("/profile", response_model=PatientProfileOut)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(require_patient)):
    patient = _get_patient_or_404(db, current_user)
    return PatientProfileOut(
        patient_id=patient.patient_id,
        name=current_user.name,
        email=current_user.email,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        address=patient.address,
        blood_group=patient.blood_group,
        profile_image=current_user.profile_image,
    )


@router.put("/profile", response_model=PatientProfileOut)
def update_profile(
    payload: PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    patient = _get_patient_or_404(db, current_user)
    if payload.name:
        current_user.name = payload.name
    for field in ("age", "gender", "phone", "address", "blood_group"):
        value = getattr(payload, field)
        if value is not None:
            setattr(patient, field, value)
    db.commit()
    return get_profile(db, current_user)


@router.post("/profile/image")
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    ext = os.path.splitext(file.filename)[1]
    filename = f"user_{current_user.id}{ext}"
    dest = os.path.join(settings.UPLOAD_DIR, "profile_images", filename)
    with open(dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    current_user.profile_image = f"/uploads/profile_images/{filename}"
    db.commit()
    return {"profile_image": current_user.profile_image}


@router.get("/doctors", response_model=list[DoctorPublicOut])
def search_doctors(
    department: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    """Search / filter doctors by department or name/specialization keyword."""
    query = db.query(Doctor).join(User).filter(Doctor.is_approved == True)  # noqa: E712
    if department:
        query = query.filter(Doctor.department == department)
    if q:
        like = f"%{q}%"
        query = query.filter((User.name.ilike(like)) | (Doctor.specialization.ilike(like)))

    results = []
    for doc in query.all():
        results.append(DoctorPublicOut(
            doctor_id=doc.doctor_id,
            name=doc.user.name,
            specialization=doc.specialization,
            department=doc.department,
            qualification=doc.qualification,
            experience=doc.experience,
            consultation_fee=doc.consultation_fee,
            profile_image=doc.user.profile_image,
        ))
    return results


@router.post("/appointments", response_model=AppointmentOut, status_code=201)
def book_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    patient = _get_patient_or_404(db, current_user)
    doctor = db.query(Doctor).filter(Doctor.doctor_id == payload.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Prevent double booking of the same doctor/date/time
    clash = db.query(Appointment).filter(
        Appointment.doctor_id == payload.doctor_id,
        Appointment.date == payload.date,
        Appointment.time == payload.time,
        Appointment.status.in_([AppointmentStatus.pending, AppointmentStatus.confirmed]),
    ).first()
    if clash:
        raise HTTPException(status_code=409, detail="That time slot is already booked")

    appt = Appointment(
        patient_id=patient.patient_id,
        doctor_id=payload.doctor_id,
        department=payload.department,
        date=payload.date,
        time=payload.time,
        reason=payload.reason,
        status=AppointmentStatus.pending,
    )
    db.add(appt)
    db.commit()
    return _to_appointment_out(appt)


@router.get("/appointments", response_model=list[AppointmentOut])
def my_appointments(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    patient = _get_patient_or_404(db, current_user)
    query = db.query(Appointment).filter(Appointment.patient_id == patient.patient_id)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    appts = query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()
    return [_to_appointment_out(a) for a in appts]


@router.post("/appointments/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    patient = _get_patient_or_404(db, current_user)
    appt = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id,
        Appointment.patient_id == patient.patient_id,
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.status in (AppointmentStatus.completed, AppointmentStatus.cancelled):
        raise HTTPException(status_code=400, detail="This appointment cannot be cancelled")

    appt.status = AppointmentStatus.cancelled
    db.commit()
    return _to_appointment_out(appt)


@router.get("/prescriptions", response_model=list[PrescriptionOut])
def my_prescriptions(db: Session = Depends(get_db), current_user: User = Depends(require_patient)):
    patient = _get_patient_or_404(db, current_user)
    rows = db.query(Prescription).filter(Prescription.patient_id == patient.patient_id).order_by(
        Prescription.created_at.desc()
    ).all()
    return [_to_prescription_out(p) for p in rows]


@router.get("/medical-records", response_model=list[MedicalRecordOut])
def my_medical_records(db: Session = Depends(get_db), current_user: User = Depends(require_patient)):
    patient = _get_patient_or_404(db, current_user)
    rows = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.patient_id).order_by(
        MedicalRecord.created_at.desc()
    ).all()
    return rows


def _to_appointment_out(appt: Appointment) -> AppointmentOut:
    return AppointmentOut(
        appointment_id=appt.appointment_id,
        patient_id=appt.patient_id,
        patient_name=appt.patient.user.name if appt.patient else None,
        doctor_id=appt.doctor_id,
        doctor_name=appt.doctor.user.name if appt.doctor else None,
        department=appt.department,
        date=appt.date,
        time=appt.time,
        reason=appt.reason,
        status=appt.status.value,
        created_at=appt.created_at,
    )


def _to_prescription_out(p: Prescription) -> PrescriptionOut:
    return PrescriptionOut(
        prescription_id=p.prescription_id,
        patient_id=p.patient_id,
        doctor_id=p.doctor_id,
        doctor_name=p.doctor.user.name if p.doctor else None,
        medicines=json.loads(p.medicines),
        instructions=p.instructions,
        pdf_path=p.pdf_path,
        created_at=p.created_at,
    )
