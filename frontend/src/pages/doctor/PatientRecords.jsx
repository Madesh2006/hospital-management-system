import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState, StatusBadge } from '../../components/ui'
import { doctorLinks } from './links'
import api from '../../services/api'

export default function PatientRecords() {
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/doctor/appointments').then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }, [])

  // Build unique patient list from the doctor's appointment history
  const patients = Array.from(
    new Map(appointments.map((a) => [a.patient_id, { patient_id: a.patient_id, name: a.patient_name }])).values()
  )

  const selectPatient = async (patient) => {
    setSelectedPatient(patient)
    const res = await api.get(`/doctor/patients/${patient.patient_id}/history`)
    setHistory(res.data)
  }

  const handleAddRecord = async (e) => {
    e.preventDefault()
    if (!diagnosis.trim()) {
      toast.error('Diagnosis is required')
      return
    }
    setSaving(true)
    try {
      await api.post('/doctor/medical-records', {
        patient_id: selectedPatient.patient_id,
        diagnosis,
        treatment,
      })
      toast.success('Medical record added')
      setDiagnosis('')
      setTreatment('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save record')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <DashboardLayout sidebar={<Sidebar links={doctorLinks} roleLabel="Doctor" />} title="Patient records" subtitle="View visit history and add diagnoses for your patients.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">My patients</h3>
          {patients.length === 0 ? (
            <EmptyState title="No patients yet" />
          ) : (
            <div className="space-y-2">
              {patients.map((p) => (
                <button
                  key={p.patient_id}
                  onClick={() => selectPatient(p)}
                  className={`w-full rounded-lg border p-3 text-left text-sm font-medium transition ${
                    selectedPatient?.patient_id === p.patient_id
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          {!selectedPatient ? (
            <EmptyState title="Select a patient to view history" />
          ) : (
            <>
              <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">Visit history — {selectedPatient.name}</h3>
              <div className="mb-6 max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                  <EmptyState title="No visit history" />
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-700">
                        <th className="py-2 pr-4 font-medium">Date</th>
                        <th className="py-2 pr-4 font-medium">Reason</th>
                        <th className="py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.appointment_id} className="border-b border-slate-50 dark:border-slate-800">
                          <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{h.date}</td>
                          <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">{h.reason || '—'}</td>
                          <td className="py-2"><StatusBadge status={h.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <h4 className="mb-3 font-semibold text-slate-800 dark:text-white">Add diagnosis</h4>
              <form onSubmit={handleAddRecord} className="space-y-3">
                <div>
                  <label className="label-text">Diagnosis</label>
                  <input required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Treatment / notes</label>
                  <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={3} className="input-field" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save record'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
