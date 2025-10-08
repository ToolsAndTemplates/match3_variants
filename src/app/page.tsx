'use client'

import { useState, useEffect, lazy, Suspense } from 'react'

// Lazy load the map component to avoid SSR issues with Leaflet
const LocationMap = lazy(() => import('@/components/LocationMap'))

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
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    currentLivingPlace: '',
    placeToWork: '',
    expectedSalary: '',
    info: '',
  })

  // Azerbaijan branch locations
  const branchLocations = [
    'Bakı',
    'Sumqayıt',
    'Gəncə',
    'Mingəçevir',
    'Şirvan',
    'Naxçıvan',
    'Lənkəran',
    'Şəki',
    'Yevlax',
    'Ağdam',
    'Füzuli',
    'Qəbələ',
    'Quba',
    'Xaçmaz',
    'Şamaxı',
    'Salyan',
    'Ağcabədi',
    'Bərdə',
    'Zaqatala',
    'Qax',
    'Balakən',
    'Qusar',
    'İsmayıllı',
    'Ağsu',
    'Göyçay',
    'Ucar',
    'Kürdəmir',
    'Sabirabad',
    'Biləsuvar',
    'Cəlilabad',
    'Masallı',
    'Astara',
    'Lerik',
    'Yardımlı',
  ]
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMapView, setShowMapView] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    // Check for job parameter in URL
    if (typeof window !== 'undefined' && jobs.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const jobId = params.get('job')
      if (jobId) {
        const job = jobs.find(j => j.id === parseInt(jobId))
        if (job) {
          setSelectedJob(job)
          // Scroll to top smoothly
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }
  }, [jobs])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs?active=true', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          placeToWork: formData.placeToWork || selectedJob?.location || '',
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
          placeToWork: '',
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">Bizim Oba</h1>
            </div>
            {selectedJob && (
              <button
                onClick={() => {
                  setSelectedJob(null)
                  setFormData({
                    name: '',
                    surname: '',
                    phone: '',
                    email: '',
                    currentLivingPlace: '',
                    placeToWork: '',
                    expectedSalary: '',
                    info: '',
                  })
                  setCvFile(null)
                }}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-orange-500 text-orange-600 hover:text-orange-700 font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Geri</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {!selectedJob ? (
        /* Job Listings */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
              <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-orange-800">Vakansiyalar Açıqdır</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-orange-800 to-gray-900 bg-clip-text text-transparent">
                Karyeranıza
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Başlayın
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-600 mb-3 font-medium">
              Azərbaycanın ən böyük supermarket şəbəkəsində
            </p>

            <div className="flex items-center justify-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold">1,610+ Filial</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">{jobs.length} Aktiv Vakansiya</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="group relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-orange-600 group-hover:text-white mb-2 transition-colors">1,610+</div>
                <div className="text-sm font-medium text-gray-600 group-hover:text-white transition-colors">Filial</div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-blue-600 group-hover:text-white mb-2 transition-colors">{jobs.length}</div>
                <div className="text-sm font-medium text-gray-600 group-hover:text-white transition-colors">Vakansiya</div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-purple-600 group-hover:text-white mb-2 transition-colors">24h</div>
                <div className="text-sm font-medium text-gray-600 group-hover:text-white transition-colors">Cavab Müddəti</div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-green-600 group-hover:text-white mb-2 transition-colors">5,000+</div>
                <div className="text-sm font-medium text-gray-600 group-hover:text-white transition-colors">Komanda Üzvü</div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Açıq Vakansiyalar</h3>
                <p className="text-gray-600">Sizə uyğun vakansiyaları kəşf edin</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border border-gray-200">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-semibold text-gray-700">{jobs.length} vakansiya</span>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-8 border border-gray-200 animate-pulse shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-7 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                          <div className="h-6 bg-gray-200 rounded-full w-36"></div>
                          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid gap-6">
                {jobs.map((job, index) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </span>
                              {job.salary_min && job.salary_max && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {job.salary_min}-{job.salary_max} AZN
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.employment_type === 'full_time' ? 'Tam ştat' : 'Yarım ştat'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                        <svg className="w-6 h-6 text-orange-600 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="relative z-10 text-gray-600 text-base leading-relaxed line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Aktiv vakansiya yoxdur
                </h3>
                <p className="text-gray-600 text-lg">
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
            className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
              <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
              <div className="flex flex-wrap gap-3 text-orange-100">
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Ayşə"
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    id="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Məmmədova"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="+994 50 555 55 55"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currentLivingPlace" className="block text-sm font-medium text-gray-700 mb-2">
                  Hazırki yaşayış yeri *
                </label>
                <input
                  type="text"
                  id="currentLivingPlace"
                  value={formData.currentLivingPlace}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Bakı, Azərbaycan"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="placeToWork" className="block text-sm font-medium text-gray-700">
                    İşləmək istədiyiniz filial
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapView(!showMapView)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    {showMapView ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Siyahı
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Xəritə
                      </>
                    )}
                  </button>
                </div>

                {!showMapView ? (
                  <div className="space-y-2">
                    <select
                      id="placeToWork"
                      value={formData.placeToWork}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        formData.placeToWork
                          ? 'border-orange-500 bg-orange-50 text-orange-900 font-semibold'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">Seçin (ixtiyari)</option>
                      {branchLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    {formData.placeToWork && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Seçilmiş filial: {formData.placeToWork}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, placeToWork: '' })}
                          className="ml-auto hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.placeToWork && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Seçilmiş: {formData.placeToWork}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, placeToWork: '' })}
                          className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <Suspense fallback={
                      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                          <p className="mt-4 text-gray-600">Xəritə yüklənir...</p>
                        </div>
                      </div>
                    }>
                      <LocationMap
                        selectedLocation={formData.placeToWork}
                        onLocationSelect={(locationName) => setFormData({ ...formData, placeToWork: locationName })}
                      />
                    </Suspense>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">İstifadə qaydaları:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Xəritədəki narıncı işarələrə klikləyərək filial seçin</li>
                            <li>Zoom etmək üçün + / - düymələrindən istifadə edin</li>
                            <li>Xəritəni hərəkət etdirmək üçün sürüşdürün</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-2 text-sm text-gray-500">
                  Seçməsəniz, vakansiya yerləşdiyi filialda qəbul ediləcəksiniz
                </p>
              </div>

              <div>
                <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700 mb-2">
                  Gözlənilən maaş (AZN) *
                </label>
                <input
                  type="number"
                  id="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-2">
                  CV (PDF, DOC, DOCX)
                </label>
                <input
                  type="file"
                  id="cv"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                />
                {cvFile && (
                  <p className="mt-2 text-sm text-orange-600">
                    ✓ {cvFile.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="info" className="block text-sm font-medium text-gray-700 mb-2">
                  Əlavə məlumat
                </label>
                <textarea
                  id="info"
                  value={formData.info}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Özünüz haqqında məlumat..."
                />
              </div>

              <button
                type="submit"
                disabled={uploading || submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg"
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
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Təbriklər!</h3>
            <p className="text-gray-600 mb-6">
              Müraciətiniz uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.
            </p>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 animate-progress"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
