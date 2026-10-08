-- =====================================================================
-- City Care Hospital — Hospital Management System
-- MySQL Schema (reference DDL — tables are also auto-created by
-- SQLAlchemy's Base.metadata.create_all() when the backend starts,
-- so running this file manually is optional but useful for review
-- or for setting up the DB ahead of time).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS hospital_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_management;

-- ---------------------------------------------------------------------
-- Users (patients, doctors, admins all live here; role distinguishes)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(150)        NOT NULL,
  email                VARCHAR(150)        NOT NULL UNIQUE,
  password_hash        VARCHAR(255)        NOT NULL,
  role                 ENUM('patient','doctor','admin') NOT NULL DEFAULT 'patient',
  profile_image        VARCHAR(255),
  is_active            BOOLEAN             DEFAULT TRUE,
  reset_token          VARCHAR(255),
  reset_token_expires  DATETIME,
  created_at           DATETIME            DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Patients
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  patient_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE,
  age          INT,
  gender       VARCHAR(20),
  phone        VARCHAR(20),
  address      VARCHAR(255),
  blood_group  VARCHAR(5),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Doctors
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL UNIQUE,
  specialization     VARCHAR(100) NOT NULL,
  department         VARCHAR(100) NOT NULL,
  qualification      VARCHAR(150),
  experience         INT,
  consultation_fee   INT,
  availability       TEXT,
  is_approved        BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(50)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id     INT NOT NULL,
  doctor_id      INT NOT NULL,
  department     VARCHAR(100) NOT NULL,
  date           DATE NOT NULL,
  time           TIME NOT NULL,
  reason         TEXT,
  status         ENUM('pending','confirmed','rejected','completed','cancelled') DEFAULT 'pending',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Prescriptions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prescriptions (
  prescription_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT NOT NULL,
  doctor_id       INT NOT NULL,
  appointment_id  INT,
  medicines       TEXT NOT NULL,   -- JSON array: [{name, dosage, frequency, duration}]
  instructions    TEXT,
  pdf_path        VARCHAR(255),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)  ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Medical Records
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_records (
  record_id    INT AUTO_INCREMENT PRIMARY KEY,
  patient_id   INT NOT NULL,
  doctor_id    INT,
  diagnosis    TEXT NOT NULL,
  treatment    TEXT,
  report_file  VARCHAR(255),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Audit Logs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  action     VARCHAR(255) NOT NULL,
  details    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
