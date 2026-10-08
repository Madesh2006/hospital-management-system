import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaHospital, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Departments', to: '/#departments' },
  { label: 'Doctors', to: '/#doctors' },
  { label: 'Contact', to: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : '/patient'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary-700 dark:text-primary-300">
          <FaHospital className="text-2xl text-primary-600" />
          City Care Hospital
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          {user ? (
            <>
              <button onClick={() => navigate(dashboardPath)} className="btn-outline !py-2">Dashboard</button>
              <button onClick={() => { logout(); navigate('/') }} className="btn-primary !py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline !py-2">Login</Link>
              <Link to="/register" className="btn-primary !py-2">Register</Link>
            </>
          )}
        </div>

        <button className="text-2xl text-slate-700 dark:text-slate-200 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3">
              {user ? (
                <>
                  <button onClick={() => { navigate(dashboardPath); setOpen(false) }} className="btn-outline flex-1 !py-2">Dashboard</button>
                  <button onClick={() => { logout(); navigate('/'); setOpen(false) }} className="btn-primary flex-1 !py-2">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline flex-1 !py-2" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary flex-1 !py-2" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
