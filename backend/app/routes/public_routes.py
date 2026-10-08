from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import Doctor
from app.models.medical import Department
from app.schemas.profile_schemas import DoctorPublicOut

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/departments")
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


@router.get("/doctors", response_model=list[DoctorPublicOut])
def list_doctors(department: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Doctor).filter(Doctor.is_approved == True)  # noqa: E712
    if department:
        query = query.filter(Doctor.department == department)
    doctors = query.all()
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
