import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaHospital, FaUserInjured, FaUserMd, FaUserShield } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value: 'patient', label: 'Patient', icon: FaUserInjured },
  { value: 'doctor', label: 'Doctor', icon: FaUserMd },
  { value: 'admin', label: 'Admin', icon: FaUserShield },
]

export default function Login() {
  const [role, setRole] = useState('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(email, password, role)
      toast.success(`Welcome back, ${data.name}!`)
      navigate(role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/patient')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="card w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold text-primary-700 dark:text-primary-300">
          <FaHospital className="text-2xl" /> City Care Hospital
        </Link>

        <div className="mb-6 grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium transition ${
                role === r.value
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-slate-200 text-slate-500 hover:border-primary-300 dark:border-slate-700'
              }`}
            >
              <r.icon className="text-lg" />
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-300">
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline dark:text-primary-300">
            Register
          </Link>
        </p>

        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400 dark:bg-slate-800/60">
          Demo admin: admin@citycare.com / Admin@123 — after running <code>python seed.py</code>
        </p>
      </div>
    </div>
  )
}
