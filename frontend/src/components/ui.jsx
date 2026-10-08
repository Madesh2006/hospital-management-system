export function StatCard({ icon: Icon, label, value, tint = 'primary' }) {
  const tints = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    teal: 'bg-accent-mint text-accent-teal dark:bg-teal-900/30 dark:text-teal-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
  }
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl ${tints[tint]}`}>
        <Icon />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-slate-400">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-14 text-center dark:border-slate-700">
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    confirmed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
    completed: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
    cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-300',
  }
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  )
}

export function DashboardLayout({ sidebar, children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      {sidebar}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {title && (
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
