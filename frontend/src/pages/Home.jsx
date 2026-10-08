import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaHeartbeat, FaBrain, FaBone, FaChild, FaStethoscope, FaAllergies,
  FaHeadSideCough, FaVenus, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope,
  FaCalendarCheck, FaUserMd, FaShieldAlt, FaClock,
} from 'react-icons/fa'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { LoadingSpinner } from '../components/ui'

const DEPT_ICONS = {
  Cardiology: FaHeartbeat,
  Neurology: FaBrain,
  Orthopedics: FaBone,
  Dermatology: FaAllergies,
  Pediatrics: FaChild,
  'General Medicine': FaStethoscope,
  ENT: FaHeadSideCough,
  Gynecology: FaVenus,
}

const TESTIMONIALS = [
  {
    name: 'Meera Joshi',
    quote: 'Booking an appointment took two minutes and the doctor actually had my full history on screen. It felt organized, not rushed.',
    role: 'Patient, Cardiology',
  },
  {
    name: 'Arjun Patel',
    quote: 'I could see my prescription and download it right after the visit instead of waiting at a counter.',
    role: 'Patient, Orthopedics',
  },
  {
    name: 'Sunita Reddy',
    quote: 'The reminders and clear time slots meant I never showed up on the wrong day again.',
    role: 'Patient, Pediatrics',
  },
]

export default function Home() {
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/public/departments').catch(() => ({ data: [] })),
      api.get('/public/doctors').catch(() => ({ data: [] })),
    ]).then(([d, doc]) => {
      setDepartments(d.data)
      setDoctors(doc.data.slice(0, 6))
      setLoading(false)
    })
  }, [])

  return (
    <div className="bg-surface-light dark:bg-surface-dark">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-primary-100">
              Trusted care, every day
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Book a doctor, manage your health, all in one place.
            </h1>
            <p className="mt-4 max-w-md text-primary-100">
              City Care Hospital connects you with specialists across 8 departments,
              keeps your prescriptions and records organized, and lets you book a
              visit in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="rounded-lg bg-white px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50">
                Book an appointment
              </Link>
              <a href="#departments" className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Explore departments
              </a>
            </div>
            <div className="mt-10 flex gap-8">
              <div>
                <p className="font-display text-3xl font-bold">40+</p>
                <p className="text-sm text-primary-100">Specialist doctors</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">8</p>
                <p className="text-sm text-primary-100">Departments</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">24/7</p>
                <p className="text-sm text-primary-100">Emergency care</p>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -top-6 -right-6 h-64 w-64 rounded-full bg-primary-400/30 blur-3xl" />
            <div className="card relative flex flex-col gap-4 p-6 text-slate-700">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-700">
                  <FaCalendarCheck />
                </div>
                <div>
                  <p className="font-semibold">Next available slot</p>
                  <p className="text-sm text-slate-500">Dr. Ananya Rao — Cardiology</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700">
                Today, 4:30 PM
                <span className="text-xs font-semibold text-emerald-600">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  <FaShieldAlt />
                </div>
                <p className="text-sm text-slate-600">Your records stay private and are only shared with your care team.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / value props */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: FaUserMd, title: 'Specialist doctors', desc: 'Choose from verified specialists across every department.' },
            { icon: FaClock, title: 'Fast booking', desc: 'Pick a department, doctor, and time slot — confirmed instantly.' },
            { icon: FaShieldAlt, title: 'Secure records', desc: 'Prescriptions and history stored securely, ready when you need them.' },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-xl text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <item.icon />
              </div>
              <h3 className="mb-1 font-display text-lg font-semibold text-slate-800 dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="bg-white py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 max-w-lg">
            <h2 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Departments</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Find the right specialist for your visit.</p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(departments.length ? departments : Object.keys(DEPT_ICONS).map((n) => ({ name: n }))).map((dept) => {
                const Icon = DEPT_ICONS[dept.name] || FaStethoscope
                return (
                  <div key={dept.name} className="card group cursor-pointer p-6 transition hover:-translate-y-1">
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-xl text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-900/30 dark:text-primary-300">
                      <Icon />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{dept.name}</h3>
                    {dept.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dept.description}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 max-w-lg">
          <h2 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Meet our doctors</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">A few of the specialists you can book with today.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : doctors.length === 0 ? (
          <p className="text-slate-400">Doctors will appear here once the backend is seeded — run <code>python seed.py</code>.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <div key={doc.doctor_id} className="card p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    {doc.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{doc.name}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">{doc.specialization}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{doc.department} · {doc.experience || 0} yrs experience</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {doc.consultation_fee ? `₹${doc.consultation_fee} consult` : 'Fee on request'}
                  </span>
                  <Link to="/register" className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
                    Book visit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-primary-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-10 font-display text-3xl font-bold">What patients say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl bg-white/10 p-6">
                <p className="text-primary-50">"{t.quote}"</p>
                <p className="mt-4 font-semibold">{t.name}</p>
                <p className="text-sm text-primary-200">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-16">
        <div className="card grid gap-8 p-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Need to see a doctor?</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Create a free account and book your first appointment today.</p>
            <Link to="/register" className="btn-primary mt-6 inline-flex">Get started</Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-primary-600" />
              <p className="text-sm text-slate-600 dark:text-slate-300">42 Wellness Avenue, Mysuru, Karnataka</p>
            </div>
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-primary-600" />
              <p className="text-sm text-slate-600 dark:text-slate-300">+91 80 1234 5678</p>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-primary-600" />
              <p className="text-sm text-slate-600 dark:text-slate-300">care@citycare.example</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} City Care Hospital. All rights reserved.
      </footer>
    </div>
  )
}
