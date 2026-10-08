import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaPlus, FaTrash } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState } from '../../components/ui'
import { doctorLinks } from './links'
import api from '../../services/api'

const emptyMedicine = { name: '', dosage: '', frequency: '', duration: '' }

export default function Prescriptions() {
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }])
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastPdf, setLastPdf] = useState(null)

  useEffect(() => {
    api.get('/doctor/appointments').then((res) => {
      setAppointments(res.data)
      setLoading(false)
    })
  }, [])

  const patients = Array.from(
    new Map(appointments.map((a) => [a.patient_id, { patient_id: a.patient_id, name: a.patient_name }])).values()
  )

  const updateMedicine = (idx, field, value) => {
    setMedicines((meds) => meds.map((m, i) => (i === idx ? { ...m, [field]: value } : m)))
  }

  const addMedicineRow = () => setMedicines((meds) => [...meds, { ...emptyMedicine }])
  const removeMedicineRow = (idx) => setMedicines((meds) => meds.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPatient) {
      toast.error('Select a patient first')
      return
    }
    const validMeds = medicines.filter((m) => m.name.trim())
    if (validMeds.length === 0) {
      toast.error('Add at least one medicine')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post('/doctor/prescriptions', {
        patient_id: selectedPatient.patient_id,
        medicines: validMeds,
        instructions,
      })
      toast.success('Prescription created')
      setLastPdf(data.pdf_path)
      setMedicines([{ ...emptyMedicine }])
      setInstructions('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create prescription')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <DashboardLayout sidebar={<Sidebar links={doctorLinks} roleLabel="Doctor" />} title="Create prescription" subtitle="Write medicines and instructions for your patient.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">Select patient</h3>
          {patients.length === 0 ? (
            <EmptyState title="No patients yet" />
          ) : (
            <div className="space-y-2">
              {patients.map((p) => (
                <button
                  key={p.patient_id}
                  onClick={() => setSelectedPatient(p)}
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
            <EmptyState title="Select a patient to write a prescription" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="font-semibold text-slate-800 dark:text-white">Prescription for {selectedPatient.name}</p>

              <div className="space-y-3">
                {medicines.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input placeholder="Medicine" value={m.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} className="input-field col-span-4" />
                    <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} className="input-field col-span-3" />
                    <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} className="input-field col-span-2" />
                    <input placeholder="Duration" value={m.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} className="input-field col-span-2" />
                    <button type="button" onClick={() => removeMedicineRow(idx)} className="col-span-1 grid place-items-center text-rose-500 hover:text-rose-700">
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addMedicineRow} className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
                <FaPlus /> Add medicine
              </button>

              <div>
                <label className="label-text">Instructions</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className="input-field" placeholder="e.g. Take after meals, avoid dairy" />
              </div>

              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Generating...' : 'Create prescription'}
              </button>

              {lastPdf && (
                <a
                  href={`/uploads/prescriptions/${lastPdf.split('/').pop()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 text-sm font-semibold text-emerald-600 hover:underline"
                >
                  View last generated PDF →
                </a>
              )}
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
