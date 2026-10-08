import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaClock, FaFileMedical, FaPrescriptionBottle } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, StatCard, LoadingSpinner, EmptyState, StatusBadge } from '../../components/ui'
import { patientLinks } from './links'
import api from '../../services/api'

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/patient/appointments'),
      api.get('/patient/medical-records'),
    ]).then(([a, r]) => {
      setAppointments(a.data)
      setRecords(r.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status))
  const completed = appointments.filter((a) => a.status === 'completed')

  return (
    <DashboardLayout sidebar={<Sidebar links={patientLinks} roleLabel="Patient" />} title="Welcome back" subtitle="Here's a quick look at your health activity.">
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FaCalendarCheck} label="Upcoming visits" value={upcoming.length} tint="primary" />
        <StatCard icon={FaClock} label="Completed visits" value={completed.length} tint="teal" />
        <StatCard icon={FaFileMedical} label="Medical records" value={records.length} tint="amber" />
        <StatCard icon={FaPrescriptionBottle} label="Total appointments" value={appointments.length} tint="rose" />
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-white">Upcoming appointments</h2>
          <Link to="/patient/book" className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">Book new →</Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState title="No upcoming appointments" subtitle="Book a visit with one of our specialists." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Doctor</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 5).map((a) => (
                  <tr key={a.appointment_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">Dr. {a.doctor_name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.department}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.date}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.time}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
