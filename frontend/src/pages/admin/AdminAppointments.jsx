import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState, StatusBadge } from '../../components/ui'
import { adminLinks } from './links'
import api from '../../services/api'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deptFilter, setDeptFilter] = useState('all')

  useEffect(() => {
    api.get('/admin/appointments').then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }, [])

  const departments = ['all', ...new Set(appointments.map((a) => a.department))]
  const filtered = deptFilter === 'all' ? appointments : appointments.filter((a) => a.department === deptFilter)

  return (
    <DashboardLayout sidebar={<Sidebar links={adminLinks} roleLabel="Admin" />} title="All appointments" subtitle="Hospital-wide appointment activity.">
      <div className="mb-5">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input-field max-w-xs">
          {departments.map((d) => <option key={d} value={d}>{d === 'all' ? 'All departments' : d}</option>)}
        </select>
      </div>

      <div className="card p-6">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="No appointments found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Patient</th>
                  <th className="py-2 pr-4 font-medium">Doctor</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.appointment_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{a.patient_name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">Dr. {a.doctor_name}</td>
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
