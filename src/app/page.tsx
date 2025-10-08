'use client'

import { useState, useEffect } from 'react'

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
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    currentLivingPlace: '',
    expectedSalary: '',
    info: '',
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?active=true')
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let cvUrl = null

      if (cvFile) {
        setUploading(true)
        const cvFormData = new FormData()
        cvFormData.append('cv', cvFile)

        const uploadResponse = await fetch('/api/upload-cv', {
          method: 'POST',
          body: cvFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error('CV yükləmə uğursuz oldu')
        }

        const uploadData = await uploadResponse.json()
        cvUrl = uploadData.url
        setUploading(false)
      }

      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          jobId: selectedJob?.id,
          jobTitle: selectedJob?.title || '',
          placeToWork: selectedJob?.location || '',
          cvUrl,
        }),
      })

      if (response.ok) {
        setShowSuccess(true)
        setFormData({
          name: '',
          surname: '',
          phone: '',
          email: '',
          currentLivingPlace: '',
          expectedSalary: '',
          info: '',
        })
        setCvFile(null)

        setTimeout(() => {
          setShowSuccess(false)
          setSelectedJob(null)
          fetchJobs()
        }, 3000)
      } else {
        alert('Müraciət göndərilmədi. Zəhmət olmasa yenidən cəhd edin.')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bizim Oba</h1>
            <a
              href="/admin"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </header>

      {!selectedJob ? (
        /* Job Listings */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Karyeranıza Başlayın
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Azərbaycanın ən böyük supermarket şəbəkəsində
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              1,610+ mağaza • {jobs.length} aktiv vakansiya
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">1,610+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mağaza</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{jobs.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vakansiya</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">24h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cavab</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">5,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Əməkdaş</div>
            </div>
          </div>

          {/* Job Listings */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Açıq Vakansiyalar</h3>

            {jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                          {job.salary_min && job.salary_max && (
                            <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {job.salary_min}-{job.salary_max} AZN
                            </span>
                          )}
                          <span className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.employment_type === 'full_time' ? 'Tam ştat' : 'Yarım ştat'}
                          </span>
                        </div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aktiv vakansiya yoxdur
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yeni vakansiyalar tezliklə əlavə ediləcək
                </p>
              </div>
            )}
          </div>
        </main>
      ) : (
        /* Application Form */
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedJob(null)}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Job Header */}
            <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-8 text-white">
              <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
              <div className="flex flex-wrap gap-3 text-emerald-100">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedJob.location}
                </span>
                {selectedJob.salary_min && selectedJob.salary_max && (
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedJob.salary_min}-{selectedJob.salary_max} AZN
                  </span>
                )}
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Ayşə"
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    id="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Məmmədova"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="+994 50 555 55 55"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currentLivingPlace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hazırki yaşayış yeri *
                </label>
                <input
                  type="text"
                  id="currentLivingPlace"
                  value={formData.currentLivingPlace}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Bakı, Azərbaycan"
                />
              </div>

              <div>
                <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gözlənilən maaş (AZN) *
                </label>
                <input
                  type="number"
                  id="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CV (PDF, DOC, DOCX)
                </label>
                <input
                  type="file"
                  id="cv"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                />
                {cvFile && (
                  <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-500">
                    ✓ {cvFile.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Əlavə məlumat
                </label>
                <textarea
                  id="info"
                  value={formData.info}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors resize-none"
                  placeholder="Özünüz haqqında məlumat..."
                />
              </div>

              <button
                type="submit"
                disabled={uploading || submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {uploading ? 'CV yüklənir...' : submitting ? 'Göndərilir...' : 'Müraciəti Göndər'}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Təbriklər!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Müraciətiniz uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.
            </p>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 animate-progress"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
