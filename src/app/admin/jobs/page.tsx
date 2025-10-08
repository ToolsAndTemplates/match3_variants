'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: number
  title: string
  description: string
  location: string
  salary_min: number | null
  salary_max: number | null
  employment_type: string
  requirements: string | null
  responsibilities: string | null
  status: string
  created_at: string
  _count?: {
    applications: number
  }
}

export default function JobsManagementPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary_min: '',
    salary_max: '',
    employment_type: 'full_time',
    requirements: '',
    responsibilities: '',
    status: 'active',
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
    }

    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs'
      const method = editingJob ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchJobs()
        resetForm()
      } else {
        alert('Xəta baş verdi')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Xəta baş verdi')
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      employment_type: job.employment_type,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      status: job.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu vakansiyani silmək istədiyinizdən əminsiniz?')) return

    try {
      const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchJobs()
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      salary_min: '',
      salary_max: '',
      employment_type: 'full_time',
      requirements: '',
      responsibilities: '',
      status: 'active',
    })
    setEditingJob(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium text-lg">
            Yüklənir...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Vakansiya İdarəetməsi
                </h1>
                <p className="text-gray-600">
                  Ümumi Vakansiyalar: <span className="font-bold text-orange-600">{jobs.length}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {showForm ? '✕ Bağla' : '➕ Yeni Vakansiya'}
                </button>
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg"
                >
                  ← Geri
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Form */}
        {showForm && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingJob ? 'Vakansiyani Redaktə Et' : 'Yeni Vakansiya Əlavə Et'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vakansiya Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Məsələn: Satış Menecer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Məkan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Bakı, Azərbaycan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700  mb-2">
                    Minimum Maaş (AZN)
                  </label>
                  <input
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700  mb-2">
                    Maksimum Maaş (AZN)
                  </label>
                  <input
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700  mb-2">
                    İş Növü
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="full_time">Tam Ştat</option>
                    <option value="part_time">Yarım Ştat</option>
                    <option value="contract">Müqavilə</option>
                    <option value="temporary">Müvəqqəti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700  mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Aktiv</option>
                    <option value="closed">Bağlı</option>
                    <option value="draft">Qaralama</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700  mb-2">
                  Təsvir
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Vakansiya haqqında ətraflı məlumat..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700  mb-2">
                  Tələblər
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Namizədə tələblər..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700  mb-2">
                  Vəzifə Öhdəlikləri
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full bg-gray-50  text-gray-700  border border-gray-300  rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="İş öhdəlikləri..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  {editingJob ? 'Yadda Saxla' : 'Əlavə Et'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Ləğv Et
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs List */}
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      📍 {job.location}
                    </span>
                    {job.salary_min && job.salary_max && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        💰 {job.salary_min}-{job.salary_max} AZN
                      </span>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      job.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status === 'active' ? '✓ Aktiv' : job.status === 'closed' ? '✕ Bağlı' : '📝 Qaralama'}
                    </span>
                    {job._count && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                        👥 {job._count.applications} müraciət
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(job)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    ✏️ Redaktə
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hələ vakansiya yoxdur
            </h3>
            <p className="text-gray-600">
              Yeni vakansiya əlavə etmək üçün yuxarıdakı düyməni klikləyin
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
