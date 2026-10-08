import json
import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, Patient, Doctor
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical import Prescription, MedicalRecord
from app.schemas.profile_schemas import DoctorProfileOut, DoctorProfileUpdate
from app.schemas.clinical_schemas import (
    AppointmentOut, AppointmentStatusUpdate, PrescriptionCreate, PrescriptionOut,
    MedicalRecordCreate, MedicalRecordOut,
)
from app.utils.dependencies import require_doctor
from app.services.pdf_service import generate_prescription_pdf
from app.services.email_service import send_appointment_confirmation_email
from app.config import settings

router = APIRouter(prefix="/api/doctor", tags=["Doctor"])


def _get_doctor_or_404(db: Session, user: User) -> Doctor:
    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


@router.get("/profile", response_model=DoctorProfileOut)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(require_doctor)):
    doctor = _get_doctor_or_404(db, current_user)
    return DoctorProfileOut(
        doctor_id=doctor.doctor_id,
        name=current_user.name,
        email=current_user.email,
        specialization=doctor.specialization,
        department=doctor.department,
        qualification=doctor.qualification,
        experience=doctor.experience,
        consultation_fee=doctor.consultation_fee,
        availability=doctor.availability,
        profile_image=current_user.profile_image,
    )


@router.put("/profile", response_model=DoctorProfileOut)
def update_profile(
    payload: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    doctor = _get_doctor_or_404(db, current_user)
    if payload.name:
        current_user.name = payload.name
    for field in ("qualification", "experience", "consultation_fee", "availability"):
        value = getattr(payload, field)
        if value is not None:
            setattr(doctor, field, value)
    db.commit()
    return get_profile(db, current_user)


@router.post("/profile/image")
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    ext = os.path.splitext(file.filename)[1]
    filename = f"user_{current_user.id}{ext}"
    dest = os.path.join(settings.UPLOAD_DIR, "profile_images", filename)
    with open(dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    current_user.profile_image = f"/uploads/profile_images/{filename}"
    db.commit()
    return {"profile_image": current_user.profile_image}


@router.get("/appointments", response_model=list[AppointmentOut])
def my_appointments(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    doctor = _get_doctor_or_404(db, current_user)
    query = db.query(Appointment).filter(Appointment.doctor_id == doctor.doctor_id)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    appts = query.order_by(Appointment.date.desc(), Appointment.time.desc()).all()
    return [_to_appointment_out(a) for a in appts]


@router.patch("/appointments/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    doctor = _get_doctor_or_404(db, current_user)
    appt = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id,
        Appointment.doctor_id == doctor.doctor_id,
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    valid_statuses = {s.value for s in AppointmentStatus}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    appt.status = AppointmentStatus(payload.status)
    db.commit()

    if appt.status == AppointmentStatus.confirmed:
        send_appointment_confirmation_email(
            appt.patient.user.email, doctor.user.name, str(appt.date), str(appt.time)
        )

    return _to_appointment_out(appt)


@router.get("/patients/{patient_id}/history", response_model=list[AppointmentOut])
def patient_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    """A doctor may only view history of patients they have an appointment with."""
    doctor = _get_doctor_or_404(db, current_user)
    has_relationship = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.doctor_id, Appointment.patient_id == patient_id
    ).first()
    if not has_relationship:
        raise HTTPException(status_code=403, detail="No relationship with this patient")

    appts = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(
        Appointment.date.desc()
    ).all()
    return [_to_appointment_out(a) for a in appts]


@router.post("/prescriptions", response_model=PrescriptionOut, status_code=201)
def create_prescription(
    payload: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    doctor = _get_doctor_or_404(db, current_user)
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    medicines_json = json.dumps([m.model_dump() for m in payload.medicines])
    prescription = Prescription(
        patient_id=payload.patient_id,
        doctor_id=doctor.doctor_id,
        appointment_id=payload.appointment_id,
        medicines=medicines_json,
        instructions=payload.instructions,
    )
    db.add(prescription)
    db.commit()

    pdf_path = generate_prescription_pdf(
        prescription.prescription_id,
        patient.user.name,
        doctor.user.name,
        doctor.specialization,
        [m.model_dump() for m in payload.medicines],
        payload.instructions or "",
    )
    prescription.pdf_path = pdf_path.replace("\\", "/")
    db.commit()

    return PrescriptionOut(
        prescription_id=prescription.prescription_id,
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
        doctor_name=doctor.user.name,
        medicines=payload.medicines,
        instructions=prescription.instructions,
        pdf_path=prescription.pdf_path,
        created_at=prescription.created_at,
    )


@router.post("/medical-records", response_model=MedicalRecordOut, status_code=201)
def add_medical_record(
    payload: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    doctor = _get_doctor_or_404(db, current_user)
    record = MedicalRecord(
        patient_id=payload.patient_id,
        doctor_id=doctor.doctor_id,
        diagnosis=payload.diagnosis,
        treatment=payload.treatment,
    )
    db.add(record)
    db.commit()
    return record


@router.post("/medical-records/{record_id}/upload-report")
def upload_report(
    record_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    record = db.query(MedicalRecord).filter(MedicalRecord.record_id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    filename = f"report_{record_id}_{file.filename}"
    dest = os.path.join(settings.UPLOAD_DIR, "reports", filename)
    with open(dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    record.report_file = f"/uploads/reports/{filename}"
    db.commit()
    return {"report_file": record.report_file}


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
