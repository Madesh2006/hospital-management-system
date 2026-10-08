import datetime as dt
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, Patient, Doctor, RoleEnum
from app.schemas.auth_schemas import (
    PatientRegister, DoctorRegister, LoginRequest, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest, UserOut,
)
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.utils.dependencies import get_current_user
from app.utils.audit import log_action
from app.services.email_service import send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register/patient", response_model=TokenResponse, status_code=201)
def register_patient(payload: PatientRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=RoleEnum.patient,
    )
    db.add(user)
    db.flush()  # get user.id before commit

    patient = Patient(
        user_id=user.id,
        age=payload.age,
        gender=payload.gender,
        phone=payload.phone,
        address=payload.address,
        blood_group=payload.blood_group,
    )
    db.add(patient)
    db.commit()
    log_action(db, user.id, "REGISTER", "Patient registered")

    return _issue_tokens(user)


@router.post("/register/doctor", response_model=TokenResponse, status_code=201)
def register_doctor(payload: DoctorRegister, db: Session = Depends(get_db)):
    """
    Public self-registration for doctors. In production you may want this to
    require admin approval before `is_approved` is set True.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=RoleEnum.doctor,
    )
    db.add(user)
    db.flush()

    doctor = Doctor(
        user_id=user.id,
        specialization=payload.specialization,
        department=payload.department,
        qualification=payload.qualification,
        experience=payload.experience,
        consultation_fee=payload.consultation_fee,
        is_approved=True,
    )
    db.add(doctor)
    db.commit()
    log_action(db, user.id, "REGISTER", "Doctor registered")

    return _issue_tokens(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.role.value != payload.role:
        raise HTTPException(
            status_code=401,
            detail=f"This account is not registered as a {payload.role}",
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")

    log_action(db, user.id, "LOGIN", f"{user.role.value} logged in")
    return _issue_tokens(user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.role == payload.role).first()
    # Always respond the same way to avoid leaking which emails exist
    generic_response = {"message": "If that account exists, a reset link has been sent."}
    if not user:
        return generic_response

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = dt.datetime.utcnow() + dt.timedelta(minutes=30)
    db.commit()

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    send_password_reset_email(user.email, reset_link)
    return generic_response


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < dt.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.password_hash = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    log_action(db, user.id, "PASSWORD_RESET", "Password reset via forgot-password flow")
    return {"message": "Password has been reset. You can now log in."}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return _issue_tokens(user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


def _issue_tokens(user: User) -> TokenResponse:
    token_data = {"user_id": user.id, "role": user.role.value, "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token_ = create_refresh_token(token_data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_,
        role=user.role.value,
        user_id=user.id,
        name=user.name,
    )
