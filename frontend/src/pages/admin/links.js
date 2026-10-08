import { FaTachometerAlt, FaUserMd, FaUserInjured, FaCalendarCheck, FaChartBar, FaHistory } from 'react-icons/fa'

export const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: FaTachometerAlt, end: true },
  { to: '/admin/doctors', label: 'Manage Doctors', icon: FaUserMd },
  { to: '/admin/patients', label: 'Manage Patients', icon: FaUserInjured },
  { to: '/admin/appointments', label: 'Appointments', icon: FaCalendarCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: FaHistory },
]
