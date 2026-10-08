import { NavLink, useNavigate } from 'react-router-dom'
import { FaHospital, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Sidebar({ links, roleLabel }) {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-surface-dark">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <FaHospital className="text-2xl text-primary-600" />
        <div>
          <p className="font-display text-sm font-bold text-primary-700 dark:text-primary-300">City Care</p>
          <p className="text-xs text-slate-400">{roleLabel} Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <link.icon className="text-lg" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 px-3 py-4 dark:border-slate-800">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.role}</p>
        </div>
        <button
          onClick={toggleTheme}
          className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  )
}
