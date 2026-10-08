import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaHospital } from 'react-icons/fa'
import api from '../services/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      toast.success('Password reset. Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed — the link may have expired')
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
        <h2 className="mb-6 text-center font-display text-xl font-bold text-slate-800 dark:text-white">Set a new password</h2>

        {!token ? (
          <p className="rounded-lg bg-rose-50 p-4 text-center text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
            Missing or invalid reset link. Please request a new one.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">New password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">Confirm password</label>
              <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Resetting...' : 'Reset password'}
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
