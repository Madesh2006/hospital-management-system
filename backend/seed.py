"""
Seeds the database with:
  - one admin account
  - the standard department list
  - a few sample doctors (so the frontend has data to show immediately)

Run with:  python seed.py
"""
from app.database.session import SessionLocal, Base, engine
from app import models  # noqa: F401
from app.models.user import User, Doctor, RoleEnum
from app.models.medical import Department
from app.utils.security import hash_password

DEPARTMENTS = [
    ("Cardiology", "Heart & cardiovascular care", "heart"),
    ("Neurology", "Brain, spine & nervous system", "brain"),
    ("Orthopedics", "Bones, joints & muscles", "bone"),
    ("Dermatology", "Skin, hair & nails", "skin"),
    ("Pediatrics", "Child & infant healthcare", "baby"),
    ("General Medicine", "General checkups & internal medicine", "stethoscope"),
    ("ENT", "Ear, nose & throat", "ear"),
    ("Gynecology", "Women's reproductive health", "female"),
]

SAMPLE_DOCTORS = [
    ("Dr. Ananya Rao", "ananya.rao@citycare.com", "Cardiologist", "Cardiology", "MD, DM Cardiology", 12, 800),
    ("Dr. Vikram Shah", "vikram.shah@citycare.com", "Neurologist", "Neurology", "MD, DM Neurology", 15, 900),
    ("Dr. Priya Nair", "priya.nair@citycare.com", "Orthopedic Surgeon", "Orthopedics", "MS Ortho", 10, 700),
    ("Dr. Sameer Khan", "sameer.khan@citycare.com", "Dermatologist", "Dermatology", "MD Dermatology", 8, 600),
    ("Dr. Kavita Iyer", "kavita.iyer@citycare.com", "Pediatrician", "Pediatrics", "MD Pediatrics", 9, 500),
    ("Dr. Rajesh Kumar", "rajesh.kumar@citycare.com", "General Physician", "General Medicine", "MBBS, MD", 20, 400),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Admin
        if not db.query(User).filter(User.email == "admin@citycare.com").first():
            admin = User(
                name="System Administrator",
                email="admin@citycare.com",
                password_hash=hash_password("Admin@123"),
                role=RoleEnum.admin,
            )
            db.add(admin)
            print("Created admin -> email: admin@citycare.com | password: Admin@123")

        # Departments
        for name, desc, icon in DEPARTMENTS:
            if not db.query(Department).filter(Department.name == name).first():
                db.add(Department(name=name, description=desc, icon=icon))

        db.commit()

        # Doctors
        for name, email, spec, dept, qual, exp, fee in SAMPLE_DOCTORS:
            if db.query(User).filter(User.email == email).first():
                continue
            user = User(
                name=name,
                email=email,
                password_hash=hash_password("Doctor@123"),
                role=RoleEnum.doctor,
            )
            db.add(user)
            db.flush()
            doctor = Doctor(
                user_id=user.id,
                specialization=spec,
                department=dept,
                qualification=qual,
                experience=exp,
                consultation_fee=fee,
                is_approved=True,
            )
            db.add(doctor)
            print(f"Created doctor -> email: {email} | password: Doctor@123")

        db.commit()
        print("\nSeed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
