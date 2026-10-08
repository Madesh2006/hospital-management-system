import { useEffect, useState } from 'react'
import { FaUserInjured, FaUserMd, FaCalendarCheck, FaClock } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, StatCard, LoadingSpinner } from '../../components/ui'
import { adminLinks } from './links'
import api from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard/stats').then((res) => {
      setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading || !stats) return <LoadingSpinner />

  return (
    <DashboardLayout sidebar={<Sidebar links={adminLinks} roleLabel="Admin" />} title="Admin dashboard" subtitle="Hospital-wide overview.">
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FaUserInjured} label="Total patients" value={stats.total_patients} tint="primary" />
        <StatCard icon={FaUserMd} label="Total doctors" value={stats.total_doctors} tint="teal" />
        <StatCard icon={FaCalendarCheck} label="Total appointments" value={stats.total_appointments} tint="amber" />
        <StatCard icon={FaClock} label="Pending requests" value={stats.pending_appointments} tint="rose" />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Appointments by department</h2>
        {stats.appointments_by_department.length === 0 ? (
          <p className="text-sm text-slate-400">No appointment data yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.appointments_by_department.map((row) => {
              const max = Math.max(...stats.appointments_by_department.map((r) => r.count), 1)
              return (
                <div key={row.department}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{row.department}</span>
                    <span className="text-slate-400">{row.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-primary-600" style={{ width: `${(row.count / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
