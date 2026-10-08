import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState, StatusBadge } from '../../components/ui'
import { patientLinks } from './links'
import api from '../../services/api'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected']

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const params = filter !== 'all' ? { status_filter: filter } : {}
    api.get('/patient/appointments', { params }).then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }

  useEffect(load, [filter])

  const handleCancel = async (id) => {
    try {
      await api.post(`/patient/appointments/${id}/cancel`)
      toast.success('Appointment cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not cancel')
    }
  }

  return (
    <DashboardLayout sidebar={<Sidebar links={patientLinks} roleLabel="Patient" />} title="My appointments" subtitle="Track, filter, and manage your visits.">
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {loading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments found" subtitle="Try a different filter or book a new visit." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Doctor</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.appointment_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">Dr. {a.doctor_name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.department}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.date}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.time}</td>
                    <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3">
                      {['pending', 'confirmed'].includes(a.status) ? (
                        <button onClick={() => handleCancel(a.appointment_id)} className="text-sm font-semibold text-rose-600 hover:underline">
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
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
