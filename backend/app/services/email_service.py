"""
Email notification structure.

In development, emails are just printed to the console. To send real emails,
fill in SMTP_* values in .env and this module will use smtplib automatically.
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        # Dev fallback: log instead of sending
        print(f"\n----- [DEV EMAIL] -----\nTo: {to_email}\nSubject: {subject}\n{html_body}\n-----------------------\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_password_reset_email(to_email: str, reset_link: str):
    subject = "Reset your City Care Hospital password"
    body = f"""
    <p>We received a request to reset your password.</p>
    <p><a href="{reset_link}">Click here to reset your password</a></p>
    <p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
    """
    return send_email(to_email, subject, body)


def send_appointment_confirmation_email(to_email: str, doctor_name: str, date: str, time: str):
    subject = "Your appointment is confirmed"
    body = f"""
    <p>Your appointment with Dr. {doctor_name} on {date} at {time} has been confirmed.</p>
    <p>Please arrive 15 minutes early with any previous medical records.</p>
    """
    return send_email(to_email, subject, body)
