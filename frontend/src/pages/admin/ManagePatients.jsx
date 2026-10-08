import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState } from '../../components/ui'
import { adminLinks } from './links'
import api from '../../services/api'

export default function ManagePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/patients').then((res) => {
      setPatients(res.data)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this patient account?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('Account deactivated')
      load()
    } catch {
      toast.error('Could not deactivate account')
    }
  }

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout sidebar={<Sidebar links={adminLinks} roleLabel="Admin" />} title="Manage patients" subtitle="View and manage registered patients.">
      <div className="mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="input-field max-w-md"
        />
      </div>

      <div className="card p-6">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="No patients found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Registered</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{p.email}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <button onClick={() => handleDeactivate(p.id)} className="text-xs font-semibold text-rose-600 hover:underline">Deactivate</button>
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
