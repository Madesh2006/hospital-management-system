import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState } from '../../components/ui'
import { adminLinks } from './links'
import api from '../../services/api'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/audit-logs').then((res) => {
      setLogs(res.data)
      setLoading(false)
    })
  }, [])

  return (
    <DashboardLayout sidebar={<Sidebar links={adminLinks} roleLabel="Admin" />} title="Audit logs" subtitle="System-wide activity trail for security and compliance.">
      <div className="card p-6">
        {loading ? (
          <LoadingSpinner />
        ) : logs.length === 0 ? (
          <EmptyState title="No activity recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 pr-4 font-medium">Details</th>
                  <th className="py-2 pr-4 font-medium">User ID</th>
                  <th className="py-2 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.log_id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{l.action}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{l.details || '—'}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{l.user_id ?? '—'}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
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
