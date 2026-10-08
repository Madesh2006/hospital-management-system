from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.user import User, Patient, Doctor, RoleEnum
from app.models.appointment import Appointment, AppointmentStatus
from app.models.medical import Department, AuditLog
from app.schemas.auth_schemas import UserOut
from app.schemas.profile_schemas import DoctorPublicOut
from app.utils.dependencies import require_admin
from app.utils.audit import log_action

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_patients = db.query(func.count(Patient.patient_id)).scalar()
    total_doctors = db.query(func.count(Doctor.doctor_id)).scalar()
    total_appointments = db.query(func.count(Appointment.appointment_id)).scalar()
    pending_appointments = db.query(func.count(Appointment.appointment_id)).filter(
        Appointment.status == AppointmentStatus.pending
    ).scalar()
    completed_appointments = db.query(func.count(Appointment.appointment_id)).filter(
        Appointment.status == AppointmentStatus.completed
    ).scalar()

    by_department = (
        db.query(Appointment.department, func.count(Appointment.appointment_id))
        .group_by(Appointment.department)
        .all()
    )

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "completed_appointments": completed_appointments,
        "appointments_by_department": [{"department": d, "count": c} for d, c in by_department],
    }


@router.get("/patients", response_model=list[UserOut])
def list_patients(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).filter(User.role == RoleEnum.patient).all()


@router.get("/doctors", response_model=list[DoctorPublicOut])
def list_doctors(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    doctors = db.query(Doctor).all()
    return [
        DoctorPublicOut(
            doctor_id=d.doctor_id,
            name=d.user.name,
            specialization=d.specialization,
            department=d.department,
            qualification=d.qualification,
            experience=d.experience,
            consultation_fee=d.consultation_fee,
            profile_image=d.user.profile_image,
        )
        for d in doctors
    ]


@router.patch("/doctors/{doctor_id}/approval")
def toggle_doctor_approval(
    doctor_id: int,
    approve: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_approved = approve
    db.commit()
    log_action(db, current_user.id, "DOCTOR_APPROVAL", f"Doctor {doctor_id} approved={approve}")
    return {"doctor_id": doctor_id, "is_approved": approve}


@router.delete("/users/{user_id}")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    log_action(db, current_user.id, "USER_DEACTIVATED", f"User {user_id} deactivated")
    return {"message": "User deactivated"}


@router.get("/appointments")
def list_all_appointments(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    appts = db.query(Appointment).order_by(Appointment.date.desc()).all()
    return [
        {
            "appointment_id": a.appointment_id,
            "patient_name": a.patient.user.name if a.patient else None,
            "doctor_name": a.doctor.user.name if a.doctor else None,
            "department": a.department,
            "date": str(a.date),
            "time": str(a.time),
            "status": a.status.value,
        }
        for a in appts
    ]


@router.get("/departments")
def list_departments(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(Department).all()


@router.post("/departments")
def create_department(
    name: str,
    description: str = "",
    icon: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    dept = Department(name=name, description=description, icon=icon)
    db.add(dept)
    db.commit()
    return dept


@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "log_id": l.log_id,
            "user_id": l.user_id,
            "action": l.action,
            "details": l.details,
            "created_at": str(l.created_at),
        }
        for l in logs
    ]
