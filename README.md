<div align="center">

# 🏥 City Care Hospital
### *Hospital Management System (HMS)*

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=2563EB&center=true&vCenter=true&width=500&lines=Full-Stack+Healthcare+Platform;FastAPI+%2B+React+%2B+MySQL;Role-Based+Access+Control" alt="Typing SVG" />

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</p>

---

</div>

A full-stack Hospital Management System:

- 💻 **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Context API + Chart.js + React Icons
- ⚙️ **Backend:** Python FastAPI + SQLAlchemy ORM + MySQL + JWT Auth + Pydantic + bcrypt
- 🗄️ **Database:** MySQL

---

### ✨ Key Capabilities

| Role | Features & Responsibilities |
| :--- | :--- |
| 🧑‍🦱 **Patients** | Register, log in, book appointments, view medical records, and download prescriptions. |
| 👨‍⚕️ **Doctors** | Manage appointments, add diagnoses, and generate prescriptions. |
| 🛡️ **Admins** | Manage doctors/patients, view analytics, and review audit logs. |

---

## 📁 1. Project structure

```text
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
