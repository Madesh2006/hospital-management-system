import { FaTachometerAlt, FaCalendarCheck, FaUserInjured, FaPrescriptionBottle, FaUserCircle } from 'react-icons/fa'

export const doctorLinks = [
  { to: '/doctor', label: 'Dashboard', icon: FaTachometerAlt, end: true },
  { to: '/doctor/appointments', label: 'Appointments', icon: FaCalendarCheck },
  { to: '/doctor/patients', label: 'Patient Records', icon: FaUserInjured },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FaPrescriptionBottle },
  { to: '/doctor/profile', label: 'Profile', icon: FaUserCircle },
]
