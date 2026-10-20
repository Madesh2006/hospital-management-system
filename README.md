# City Care Hospital — Hospital Management System (HMS)

A full-stack Hospital Management System:

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Context API + Chart.js + React Icons
- **Backend:** Python FastAPI + SQLAlchemy ORM + MySQL + JWT Auth + Pydantic + bcrypt
- **Database:** MySQL

Patients can register, log in, book appointments, view medical records, and download prescriptions.
Doctors can manage appointments, add diagnoses, and generate prescriptions.
Admins can manage doctors/patients, view analytics, and review audit logs.

---

## 1. Project structure

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
    ├── vite.config.js               # Dev proxy to backend on :8000
    └── tailwind.config.js
```

---

## 2. Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.x running locally (or reachable)

---

## 3. Backend setup

```bash
cd hospital-management-system/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set DB_USER / DB_PASSWORD / DB_NAME / JWT_SECRET_KEY etc.
```

### Create the database

Either let SQLAlchemy create the tables automatically (default — happens on
first run of `main.py`), **after** creating the empty schema:

```sql
CREATE DATABASE hospital_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

...or run the full reference DDL yourself:

```bash
mysql -u root -p < database/schema.sql
```

### Seed initial data (admin account, departments, sample doctors)

```bash
python seed.py
```

This creates:
- Admin login: `admin@citycare.com` / `Admin@123`
- Sample doctor logins: e.g. `ananya.rao@citycare.com` / `Doctor@123` (see `seed.py` for the full list)
- The 8 standard departments (Cardiology, Neurology, Orthopedics, Dermatology, Pediatrics, General Medicine, ENT, Gynecology)

### Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000`
- Interactive docs (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 4. Frontend setup

```bash
cd hospital-management-system/frontend
npm install
npm run dev
```

- App runs at `http://localhost:5173`
- Vite's dev server proxies `/api` and `/uploads` requests to `http://localhost:8000` (see `vite.config.js`), so no CORS config is needed in development beyond what's already set in `app/main.py`.

---

## 5. Using the app

1. Open `http://localhost:5173`.
2. **Register** as a Patient or a Doctor from the Register page, or **Login** with the seeded Admin account.
3. **Patients:** browse/search doctors, book an appointment, track status, view records/prescriptions, update your profile.
4. **Doctors:** accept/reject/complete appointments, add diagnoses, write prescriptions (auto-generates a downloadable PDF).
5. **Admins:** view hospital-wide stats/analytics, manage doctors (approve/suspend) and patients, browse all appointments, and check the audit log.

---

## 6. Key API endpoints

| Area | Method & Path |
|---|---|
| Register patient | `POST /api/auth/register/patient` |
| Register doctor | `POST /api/auth/register/doctor` |
| Login | `POST /api/auth/login` |
| Forgot / reset password | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Refresh token | `POST /api/auth/refresh` |
| Patient profile | `GET/PUT /api/patient/profile` |
| Search doctors | `GET /api/patient/doctors` |
| Book appointment | `POST /api/patient/appointments` |
| My appointments / cancel | `GET /api/patient/appointments`, `POST /api/patient/appointments/{id}/cancel` |
| My prescriptions / records | `GET /api/patient/prescriptions`, `GET /api/patient/medical-records` |
| Doctor profile | `GET/PUT /api/doctor/profile` |
| Doctor's appointments / status | `GET /api/doctor/appointments`, `PATCH /api/doctor/appointments/{id}/status` |
| Patient history (doctor view) | `GET /api/doctor/patients/{patient_id}/history` |
| Create prescription | `POST /api/doctor/prescriptions` |
| Add medical record / upload report | `POST /api/doctor/medical-records`, `POST /api/doctor/medical-records/{id}/upload-report` |
| Admin dashboard stats | `GET /api/admin/dashboard/stats` |
| Manage doctors / patients | `GET /api/admin/doctors`, `PATCH /api/admin/doctors/{id}/approval`, `GET /api/admin/patients`, `DELETE /api/admin/users/{id}` |
| All appointments / audit logs | `GET /api/admin/appointments`, `GET /api/admin/audit-logs` |
| Public departments/doctors (for homepage) | `GET /api/public/departments`, `GET /api/public/doctors` |

Full interactive reference: `http://localhost:8000/docs`.

---

## 7. Notes & production considerations

- **Migrations:** `Base.metadata.create_all()` runs automatically for convenience in development. For production, switch to Alembic migrations (the package is already in `requirements.txt`).
- **Email:** if `SMTP_USER`/`SMTP_PASSWORD` are left blank in `.env`, emails (password reset, appointment confirmation) are printed to the backend console instead of sent — handy for local testing.
- **File uploads:** profile photos, medical report files, and generated prescription PDFs are stored under `backend/uploads/` and served at `/uploads/...`. Swap this for S3/Cloud Storage in production.
- **JWT secret:** change `JWT_SECRET_KEY` in `.env` before deploying.
- **CORS:** `FRONTEND_ORIGIN` in `.env` controls the allowed origin; update it for your deployed frontend URL.
- **Dark/Light mode:** toggled from the sidebar (dashboards) or navbar (public site); preference is stored in `localStorage`.
