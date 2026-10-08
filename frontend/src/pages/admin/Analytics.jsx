import { useEffect, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, StatCard } from '../../components/ui'
import { adminLinks } from './links'
import api from '../../services/api'
import { FaUserInjured, FaUserMd, FaCalendarCheck } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard/stats').then((res) => {
      setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading || !stats) return <LoadingSpinner />

  const deptLabels = stats.appointments_by_department.map((d) => d.department)
  const deptCounts = stats.appointments_by_department.map((d) => d.count)

  const barData = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Appointments',
        data: deptCounts,
        backgroundColor: '#1f83f5',
        borderRadius: 6,
      },
    ],
  }

  const statusData = {
    labels: ['Pending', 'Completed', 'Other'],
    datasets: [
      {
        data: [
          stats.pending_appointments,
          stats.completed_appointments,
          Math.max(stats.total_appointments - stats.pending_appointments - stats.completed_appointments, 0),
        ],
        backgroundColor: ['#f59e0b', '#0ea5a0', '#94a3b8'],
      },
    ],
  }

  return (
    <DashboardLayout sidebar={<Sidebar links={adminLinks} roleLabel="Admin" />} title="Analytics" subtitle="Hospital performance at a glance.">
      <div className="mb-6 grid gap-5 sm:grid-cols-3">
        <StatCard icon={FaUserInjured} label="Patients" value={stats.total_patients} tint="primary" />
        <StatCard icon={FaUserMd} label="Doctors" value={stats.total_doctors} tint="teal" />
        <StatCard icon={FaCalendarCheck} label="Appointments" value={stats.total_appointments} tint="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Appointments by department</h2>
          {deptLabels.length === 0 ? <p className="text-sm text-slate-400">No data yet.</p> : <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />}
        </div>
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-slate-800 dark:text-white">Appointment status breakdown</h2>
          <div className="mx-auto max-w-xs">
            <Doughnut data={statusData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
