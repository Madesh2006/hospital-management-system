<div align="center">

<!-- Animated Header Wave Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,12,24&height=180&section=header&text=City%20Care%20Hospital&fontSize=42&fontAlignY=38&animation=twinkling&fontColor=ffffff&desc=Hospital%20Management%20System%20(HMS)&descSize=18&descAlignY=60&descAlign=50" width="100%" />

<!-- Dynamic Animated Typing Banner -->
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=00D2FF&center=true&vCenter=true&width=620&lines=Full-Stack+Enterprise+Healthcare+Platform;FastAPI+%E2%80%A2+React+18+%E2%80%A2+MySQL+%E2%80%A2+Tailwind+CSS;Role-Based+Access+Control+(RBAC);Automated+Prescriptions+%26+Audit+Trail" alt="Typing Animation" />
</p>

<!-- Technology Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT_Auth-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT Auth" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Contributions-Welcome-orange.svg?style=flat-square" alt="Contributions Welcome" />
</p>

---

</div>

## 📌 Overview

**City Care Hospital** is a full-stack Hospital Management System (HMS) designed to streamline clinical consultations, patient appointments, and administrative controls within a single platform.

* 💻 **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Context API + Chart.js + React Icons
* ⚙️ **Backend:** Python FastAPI + SQLAlchemy ORM + MySQL + JWT Auth + Pydantic + bcrypt
* 🗄️ **Database:** MySQL

---

## ✨ Key Capabilities

| Role | Badge | Features & Responsibilities |
| :--- | :---: | :--- |
| 🧑‍🦱 **Patients** | `Self-Service` | Register, log in, book appointments, view medical records, and download prescriptions. |
| 👨‍⚕️ **Doctors** | `Clinical` | Manage appointments, add diagnoses, and generate prescriptions. |
| 🛡️ **Admins** | `Management` | Manage doctors/patients, view analytics, and review audit logs. |

---

## 🛠️ System Architecture

```text
  ┌─────────────────────────────────────────────────────────┐
  │                 React 18 Frontend Client                │
  │     (Tailwind CSS • Context API • Axios Interceptors)   │
  └───────────────────────────┬─────────────────────────────┘
                              │ HTTPS / JSON (JWT Protected)
                              ▼
  ┌─────────────────────────────────────────────────────────┐
  │                   FastAPI REST Engine                   │
  │     (Pydantic Validation • RBAC Middleware • bcrypt)    │
  └───────────────┬─────────────────────────┬───────────────┘
                  │                         │
                  ▼                         ▼
      ┌───────────────────────┐ ┌───────────────────────┐
      │     MySQL Database    │ │    Micro-Services     │
      │  (SQLAlchemy Sessions)│ │  (PDFs & SMTP Alerts) │
      └───────────────────────┘ └───────────────────────┘
```



## Project Structure

```
hospital-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── config.py             # Settings (reads .env)
│   │   ├── database/             # SQLAlchemy engine/session
│   │   ├── models/                # SQLAlchemy models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── routes/                # auth / patient / doctor / admin / public routers
│   │   ├── services/               # email + PDF generation
│   │   └── utils/                  # security (JWT/bcrypt), RBAC deps, audit log
│   ├── database/schema.sql        # Raw MySQL DDL (reference)
│   ├── seed.py                     # Seeds admin + departments + sample doctors
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── main.jsx / App.jsx      # Entry + router
    │   ├── context/                 # AuthContext, ThemeContext (dark/light)
    │   ├── services/api.js          # Axios client with JWT + refresh interceptor
    │   ├── components/               # Navbar, Sidebar, ProtectedRoute, shared UI
    │   └── pages/
    │       ├── Home.jsx, Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx
    │       ├── patient/               # Patient portal
    │       ├── doctor/                # Doctor portal
    │       └── admin/                 # Admin portal
    ├── package.json
    └── vite.config.js               # Dev proxy to backend on :8000
