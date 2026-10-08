import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaSearch } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner, EmptyState } from '../../components/ui'
import { patientLinks } from './links'
import api from '../../services/api'

const DEPARTMENTS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'General Medicine', 'ENT', 'Gynecology',
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

export default function BookAppointment() {
  const [department, setDepartment] = useState('')
  const [search, setSearch] = useState('')
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoadingDoctors(true)
    const params = {}
    if (department) params.department = department
    if (search) params.q = search
    api.get('/patient/doctors', { params }).then((res) => {
      setDoctors(res.data)
      setLoadingDoctors(false)
    })
  }, [department, search])

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selectedDoctor || !date || !time) {
      toast.error('Please select a doctor, date, and time slot')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/patient/appointments', {
        doctor_id: selectedDoctor.doctor_id,
        department: selectedDoctor.department,
        date,
        time: `${time}:00`,
        reason,
      })
      toast.success('Appointment booked! You will see it under My Appointments.')
      setSelectedDoctor(null)
      setDate('')
      setTime('')
      setReason('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <DashboardLayout sidebar={<Sidebar links={patientLinks} roleLabel="Patient" />} title="Book an appointment" subtitle="Choose a department, a doctor, then a time that works for you.">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step 1 & 2: department + doctor list */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field sm:max-w-[220px]">
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor or specialization"
                className="input-field pl-9"
              />
            </div>
          </div>

          {loadingDoctors ? (
            <LoadingSpinner label="Finding doctors..." />
          ) : doctors.length === 0 ? (
            <EmptyState title="No doctors found" subtitle="Try a different department or search term." />
          ) : (
            <div className="space-y-3">
              {doctors.map((doc) => (
                <button
                  type="button"
                  key={doc.doctor_id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                    selectedDoctor?.doctor_id === doc.doctor_id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 hover:border-primary-300 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">Dr. {doc.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{doc.specialization} · {doc.department}</p>
                    <p className="text-xs text-slate-400">{doc.experience || 0} yrs experience · {doc.qualification || ''}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {doc.consultation_fee ? `₹${doc.consultation_fee}` : '—'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 3 & 4: date/time + confirm */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">Your selection</h3>
          {!selectedDoctor ? (
            <EmptyState title="Pick a doctor first" />
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <div className="rounded-lg bg-primary-50 p-3 text-sm dark:bg-primary-900/20">
                <p className="font-semibold text-primary-800 dark:text-primary-200">Dr. {selectedDoctor.name}</p>
                <p className="text-primary-600 dark:text-primary-300">{selectedDoctor.specialization}</p>
              </div>

              <div>
                <label className="label-text">Date</label>
                <input type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="label-text">Time slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${
                        time === slot
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">Reason for visit (optional)</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="input-field" placeholder="Brief description of your symptoms" />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Booking...' : 'Confirm appointment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
