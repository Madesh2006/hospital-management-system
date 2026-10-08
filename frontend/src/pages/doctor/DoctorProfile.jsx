import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCamera } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { DashboardLayout, LoadingSpinner } from '../../components/ui'
import { doctorLinks } from './links'
import api from '../../services/api'

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/doctor/profile').then((res) => {
      setProfile(res.data)
      setLoading(false)
    })
  }, [])

  const update = (field) => (e) => setProfile((p) => ({ ...p, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/doctor/profile', {
        name: profile.name,
        qualification: profile.qualification,
        experience: profile.experience ? Number(profile.experience) : null,
        consultation_fee: profile.consultation_fee ? Number(profile.consultation_fee) : null,
        availability: profile.availability,
      })
      setProfile(data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/doctor/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile((p) => ({ ...p, profile_image: data.profile_image }))
      toast.success('Profile photo updated')
    } catch {
      toast.error('Could not upload image')
    }
  }

  if (loading || !profile) return <LoadingSpinner />

  return (
    <DashboardLayout sidebar={<Sidebar links={doctorLinks} roleLabel="Doctor" />} title="My profile" subtitle="Update your professional details.">
      <div className="card mx-auto max-w-2xl p-8">
        <div className="mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {profile.profile_image ? (
                <img src={profile.profile_image} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                profile.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-primary-600 text-white shadow">
              <FaCamera className="text-xs" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-white">Dr. {profile.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.specialization} · {profile.department}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label-text">Full name</label>
            <input value={profile.name || ''} onChange={update('name')} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Qualification</label>
            <input value={profile.qualification || ''} onChange={update('qualification')} className="input-field" />
          </div>
          <div>
            <label className="label-text">Experience (years)</label>
            <input type="number" value={profile.experience || ''} onChange={update('experience')} className="input-field" />
          </div>
          <div>
            <label className="label-text">Consultation fee (₹)</label>
            <input type="number" value={profile.consultation_fee || ''} onChange={update('consultation_fee')} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="label-text">Availability notes</label>
            <textarea value={profile.availability || ''} onChange={update('availability')} rows={3} className="input-field" placeholder='e.g. Mon-Fri 9am-1pm, Sat 9am-12pm' />
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
