import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState } from '../../components/ui'
import { adminLinks } from './links'
import api from '../../services/api'

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/doctors').then((res) => {
      setDoctors(res.data)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const toggleApproval = async (doctorId, approve) => {
    try {
      await api.patch(`/admin/doctors/${doctorId}/approval`, null, { params: { approve } })
      toast.success(approve ? 'Doctor approved' : 'Doctor suspended')
      load()
    } catch {
      toast.error('Could not update doctor status')
    }
  }

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout sidebar={<Sidebar links={adminLinks} roleLabel="Admin" />} title="Manage doctors" subtitle="View, search, and manage doctor accounts.">
      <div className="mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialization, or department"
          className="input-field max-w-md"
        />
      </div>

      <div className="card p-6">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="No doctors found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Specialization</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Fee</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.doctor_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">Dr. {d.name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{d.specialization}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{d.department}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{d.consultation_fee ? `₹${d.consultation_fee}` : '—'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleApproval(d.doctor_id, true)} className="text-xs font-semibold text-emerald-600 hover:underline">Approve</button>
                        <button onClick={() => toggleApproval(d.doctor_id, false)} className="text-xs font-semibold text-rose-600 hover:underline">Suspend</button>
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
