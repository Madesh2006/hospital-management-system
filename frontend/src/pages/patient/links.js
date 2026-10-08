import { FaTachometerAlt, FaCalendarPlus, FaCalendarCheck, FaFileMedical, FaUserCircle } from 'react-icons/fa'

export const patientLinks = [
  { to: '/patient', label: 'Dashboard', icon: FaTachometerAlt, end: true },
  { to: '/patient/book', label: 'Book Appointment', icon: FaCalendarPlus },
  { to: '/patient/appointments', label: 'My Appointments', icon: FaCalendarCheck },
  { to: '/patient/records', label: 'Medical Records', icon: FaFileMedical },
  { to: '/patient/profile', label: 'Profile', icon: FaUserCircle },
]
