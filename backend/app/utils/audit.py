from sqlalchemy.orm import Session
from app.models.medical import AuditLog


def log_action(db: Session, user_id: int | None, action: str, details: str = ""):
    entry = AuditLog(user_id=user_id, action=action, details=details)
    db.add(entry)
    db.commit()
