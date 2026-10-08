import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaHospital } from 'react-icons/fa'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('patient')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email, role })
      setSent(true)
      toast.success('If that account exists, a reset link has been sent.')
    } catch {
      toast.error('Something went wrong. Try again.')
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
        <h2 className="mb-2 text-center font-display text-xl font-bold text-slate-800 dark:text-white">Forgot password</h2>
        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Enter your account email and we'll send you a reset link.
        </p>

        {sent ? (
          <p className="rounded-lg bg-emerald-50 p-4 text-center text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            Check your email (or the server console in dev mode) for the reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Account type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-300">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
