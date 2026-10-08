import { useEffect, useState } from 'react'
import { FaCalendarDay, FaClock, FaCheckCircle, FaUserInjured } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, StatCard, LoadingSpinner, EmptyState, StatusBadge } from '../../components/ui'
import { doctorLinks } from './links'
import api from '../../services/api'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/doctor/appointments').then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter((a) => a.date === today)
  const pending = appointments.filter((a) => a.status === 'pending')
  const completed = appointments.filter((a) => a.status === 'completed')
  const uniquePatients = new Set(appointments.map((a) => a.patient_id)).size

  return (
    <DashboardLayout sidebar={<Sidebar links={doctorLinks} roleLabel="Doctor" />} title="Doctor dashboard" subtitle="Your schedule and patient activity at a glance.">
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FaCalendarDay} label="Today's appointments" value={todayAppts.length} tint="primary" />
        <StatCard icon={FaClock} label="Pending requests" value={pending.length} tint="amber" />
        <StatCard icon={FaCheckCircle} label="Completed visits" value={completed.length} tint="teal" />
        <StatCard icon={FaUserInjured} label="Patients seen" value={uniquePatients} tint="rose" />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Today's schedule</h2>
        {todayAppts.length === 0 ? (
          <EmptyState title="No appointments scheduled for today" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Patient</th>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Reason</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.map((a) => (
                  <tr key={a.appointment_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{a.patient_name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.time}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.reason || '—'}</td>
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
