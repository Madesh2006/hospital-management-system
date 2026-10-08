import { useEffect, useState } from 'react'
import { FaFileDownload, FaFileMedicalAlt } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState } from '../../components/ui'
import { patientLinks } from './links'
import api from '../../services/api'

export default function MedicalRecords() {
  const [records, setRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/patient/medical-records'),
      api.get('/patient/prescriptions'),
    ]).then(([r, p]) => {
      setRecords(r.data)
      setPrescriptions(p.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <DashboardLayout sidebar={<Sidebar links={patientLinks} roleLabel="Patient" />} title="Medical records" subtitle="Your diagnosis history and downloadable prescriptions.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-800 dark:text-white">
            <FaFileMedicalAlt className="text-primary-600" /> Diagnosis history
          </h2>
          {records.length === 0 ? (
            <EmptyState title="No medical records yet" />
          ) : (
            <div className="space-y-4">
              {records.map((r) => (
                <div key={r.record_id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-white">{r.diagnosis}</p>
                  {r.treatment && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Treatment: {r.treatment}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                    {r.report_file && (
                      <a href={r.report_file} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-300">
                        View report
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-800 dark:text-white">
            <FaFileDownload className="text-primary-600" /> Prescriptions
          </h2>
          {prescriptions.length === 0 ? (
            <EmptyState title="No prescriptions yet" />
          ) : (
            <div className="space-y-4">
              {prescriptions.map((p) => (
                <div key={p.prescription_id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-700">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-slate-800 dark:text-white">Dr. {p.doctor_name}</p>
                    <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <ul className="mb-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    {p.medicines.map((m, i) => (
                      <li key={i}>• {m.name} — {m.dosage}, {m.frequency}, {m.duration}</li>
                    ))}
                  </ul>
                  {p.instructions && <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">{p.instructions}</p>}
                  {p.pdf_path && (
                    <a
                      href={`/uploads/prescriptions/${p.pdf_path.split('/').pop()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300"
                    >
                      <FaFileDownload /> Download PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
