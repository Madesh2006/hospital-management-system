import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState, StatusBadge } from '../../components/ui'
import { doctorLinks } from './links'
import api from '../../services/api'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected']

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const params = filter !== 'all' ? { status_filter: filter } : {}
    api.get('/doctor/appointments', { params }).then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }

  useEffect(load, [filter])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/doctor/appointments/${id}/status`, { status })
      toast.success(`Appointment ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update appointment')
    }
  }

  return (
    <DashboardLayout sidebar={<Sidebar links={doctorLinks} roleLabel="Doctor" />} title="Appointments" subtitle="Accept, reject, or complete patient visits.">
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
          <EmptyState title="No appointments found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Patient</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Reason</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.appointment_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{a.patient_name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.date}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.time}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{a.reason || '—'}</td>
                    <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(a.appointment_id, 'confirmed')} className="text-xs font-semibold text-emerald-600 hover:underline">Accept</button>
                            <button onClick={() => updateStatus(a.appointment_id, 'rejected')} className="text-xs font-semibold text-rose-600 hover:underline">Reject</button>
                          </>
                        )}
                        {a.status === 'confirmed' && (
                          <button onClick={() => updateStatus(a.appointment_id, 'completed')} className="text-xs font-semibold text-primary-600 hover:underline">Mark completed</button>
                        )}
                        {!['pending', 'confirmed'].includes(a.status) && <span className="text-slate-300">—</span>}
                      </div>
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
