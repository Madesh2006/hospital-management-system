"""
Generates a simple PDF prescription using reportlab.
"""
import os
import json
import datetime as dt

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from app.config import settings


def generate_prescription_pdf(
    prescription_id: int,
    patient_name: str,
    doctor_name: str,
    specialization: str,
    medicines: list,
    instructions: str,
) -> str:
    filename = f"prescription_{prescription_id}.pdf"
    filepath = os.path.join(settings.UPLOAD_DIR, "prescriptions", filename)

    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4

    # Header
    c.setFillColorRGB(0.06, 0.35, 0.66)  # hospital blue
    c.rect(0, height - 30 * mm, width, 30 * mm, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(20 * mm, height - 18 * mm, "City Care Hospital")
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, height - 25 * mm, "Prescription")

    y = height - 45 * mm
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(20 * mm, y, f"Patient: {patient_name}")
    c.drawString(120 * mm, y, f"Date: {dt.date.today().isoformat()}")
    y -= 7 * mm
    c.drawString(20 * mm, y, f"Doctor: Dr. {doctor_name} ({specialization})")
    y -= 12 * mm

    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Medicines")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    for med in medicines:
        line = f"- {med['name']}  |  {med['dosage']}  |  {med['frequency']}  |  {med['duration']}"
        c.drawString(22 * mm, y, line)
        y -= 6 * mm

    y -= 6 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, "Instructions")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    for line in (instructions or "No additional instructions.").split("\n"):
        c.drawString(22 * mm, y, line)
        y -= 6 * mm

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(20 * mm, 15 * mm, "This is a system-generated prescription from City Care Hospital HMS.")

    c.save()
    return filepath
