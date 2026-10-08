import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaHospital, FaUserInjured, FaUserMd } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const DEPARTMENTS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology',
  'Pediatrics', 'General Medicine', 'ENT', 'Gynecology',
]

export default function Register() {
  const [accountType, setAccountType] = useState('patient')
  const [loading, setLoading] = useState(false)
  const { registerPatient, registerDoctor } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: '', phone: '', address: '', blood_group: '',
    specialization: '', department: DEPARTMENTS[0], qualification: '', experience: '', consultation_fee: '',
  })

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let data
      if (accountType === 'patient') {
        data = await registerPatient({
          name: form.name, email: form.email, password: form.password,
          age: form.age ? Number(form.age) : null,
          gender: form.gender || null, phone: form.phone || null,
          address: form.address || null, blood_group: form.blood_group || null,
        })
        navigate('/patient')
      } else {
        data = await registerDoctor({
          name: form.name, email: form.email, password: form.password,
          specialization: form.specialization, department: form.department,
          qualification: form.qualification || null,
          experience: form.experience ? Number(form.experience) : null,
          consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
        })
        navigate('/doctor')
      }
      toast.success(`Welcome, ${data.name}!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 py-10 dark:bg-surface-dark">
      <div className="card w-full max-w-lg p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold text-primary-700 dark:text-primary-300">
          <FaHospital className="text-2xl" /> City Care Hospital
        </Link>

        <div className="mb-6 grid grid-cols-2 gap-2">
          {[{ value: 'patient', label: 'I am a Patient', icon: FaUserInjured }, { value: 'doctor', label: 'I am a Doctor', icon: FaUserMd }].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setAccountType(t.value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium transition ${
                accountType === t.value
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-slate-200 text-slate-500 dark:border-slate-700'
              }`}
            >
              <t.icon className="text-lg" />
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Full name</label>
              <input required value={form.name} onChange={update('name')} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label-text">Email</label>
              <input type="email" required value={form.email} onChange={update('email')} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label-text">Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={update('password')} className="input-field" />
            </div>

            {accountType === 'patient' ? (
              <>
                <div>
                  <label className="label-text">Age</label>
                  <input type="number" value={form.age} onChange={update('age')} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Gender</label>
                  <select value={form.gender} onChange={update('gender')} className="input-field">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Phone</label>
                  <input value={form.phone} onChange={update('phone')} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Blood group</label>
                  <input value={form.blood_group} onChange={update('blood_group')} className="input-field" placeholder="O+" />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Address</label>
                  <input value={form.address} onChange={update('address')} className="input-field" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label-text">Department</label>
                  <select value={form.department} onChange={update('department')} className="input-field">
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Specialization</label>
                  <input required value={form.specialization} onChange={update('specialization')} className="input-field" placeholder="Cardiologist" />
                </div>
                <div>
                  <label className="label-text">Qualification</label>
                  <input value={form.qualification} onChange={update('qualification')} className="input-field" placeholder="MD, DM" />
                </div>
                <div>
                  <label className="label-text">Experience (years)</label>
                  <input type="number" value={form.experience} onChange={update('experience')} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Consultation fee (₹)</label>
                  <input type="number" value={form.consultation_fee} onChange={update('consultation_fee')} className="input-field" />
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-300">Login</Link>
        </p>
      </div>
    </div>
  )
}
