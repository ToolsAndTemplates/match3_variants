'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

interface Application {
  id: number
  job_id: number | null
  name: string
  surname: string
  phone: string
  email: string | null
  current_living_place: string
  place_to_work: string
  expected_salary: number
  cv_url: string | null
  info: string | null
  created_at: string
  job?: {
    title: string
  }
}

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'applications' | 'analytics'>('applications')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        setUsername('')
        setPassword('')
      } else {
        setLoginError(data.error || 'Giriş uğursuz oldu')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setApplications([])
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/applications')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      setApplications(data)
    } catch (err) {
      setError('Failed to load applications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    const exportData = filteredApplications.map((app) => ({
      ID: app.id,
      Ad: app.name,
      Soyad: app.surname,
      Telefon: app.phone,
      Email: app.email || '',
      'Hazırki yaşayış yeri': app.current_living_place,
      'İş yeri': app.place_to_work,
      'Vəzifə': app.job?.title || 'Ümumi',
      'Gözlənilən maaş (AZN)': app.expected_salary,
      'CV URL': app.cv_url || '',
      'Əlavə məlumat': app.info || '',
      'Müraciət tarixi': new Date(app.created_at).toLocaleString(),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
      { wch: 50 }, { wch: 30 }, { wch: 20 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Müraciətlər')
    const fileName = `is_muracietleri_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      (app.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = filterLocation === '' || app.place_to_work === filterLocation

    return matchesSearch && matchesLocation
  })

  const uniqueLocations = Array.from(new Set(applications.map((app) => app.place_to_work))).sort()

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplications = filteredApplications.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterLocation])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">Daxil olmaq üçün məlumatlarınızı daxil edin</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  İstifadəçi adı
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="İstifadəçi adınızı daxil edin"
                  required
                  disabled={loggingIn}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifrə
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Şifrənizi daxil edin"
                  required
                  disabled={loggingIn}
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg"
              >
                {loggingIn ? 'Giriş edilir...' : 'Daxil ol'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center bg-white rounded-lg border border-gray-200 p-8 max-w-md shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Xəta</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchApplications}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-lg"
          >
            Yenidən Cəhd Et
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">
                {applications.length} ümumi müraciət
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={filteredApplications.length === 0}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıxış
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'applications'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Müraciətlər
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Analitika
            </button>
            <button
              onClick={() => window.location.href = '/admin/jobs'}
              className="pb-3 px-1 font-medium transition-colors border-b-2 border-transparent text-gray-600 hover:text-gray-900"
            >
              Vakansiyalar
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="pb-3 px-1 font-medium transition-colors border-b-2 border-transparent text-gray-600 hover:text-gray-900"
            >
              Ana Səhifə
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'applications' ? (
          <>
            {/* Filters */}
            <div className="mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Axtar
                    </label>
                    <input
                      type="text"
                      placeholder="Ad, telefon və ya vəzifə..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Məkan
                    </label>
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Bütün məkanlar</option>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Müraciət tapılmadı
                  </h3>
                  <p className="text-gray-600">
                    Filtrləri dəyişdirməyi cəhd edin
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Ad Soyad
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Əlaqə
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Vəzifə
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Maaş
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            CV
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {app.name} {app.surname}
                              </div>
                              <div className="text-sm text-gray-600">
                                {app.current_living_place}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{app.phone}</div>
                              <div className="text-sm text-gray-600">
                                {app.email || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {app.job?.title || 'Ümumi'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {app.place_to_work}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {app.expected_salary} AZN
                            </td>
                            <td className="px-6 py-4">
                              {app.cv_url ? (
                                <a
                                  href={app.cv_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Yüklə
                                </a>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Göstərilir {startIndex + 1} - {Math.min(endIndex, filteredApplications.length)} / {filteredApplications.length}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Əvvəlki
                          </button>
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Növbəti
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Analytics Tab */
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Ümumi</div>
                <div className="text-3xl font-bold text-orange-600">{applications.length}</div>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Orta Maaş</div>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(applications.reduce((sum, app) => sum + app.expected_salary, 0) / applications.length || 0)} AZN
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Məkanlar</div>
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(applications.map(app => app.place_to_work)).size}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="text-sm text-gray-600 mb-1">Vəzifələr</div>
                <div className="text-3xl font-bold text-green-600">
                  {new Set(applications.map(app => app.job?.title || 'Ümumi')).size}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vəzifələrə görə
                </h3>
                <div className="space-y-3">
                  {Object.entries(
                    applications.reduce((acc, app) => {
                      const title = app.job?.title || 'Ümumi'
                      acc[title] = (acc[title] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([title, count]) => {
                      const percentage = (count / applications.length) * 100
                      return (
                        <div key={title}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700">{title}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Məkanlara görə (Top 10)
                </h3>
                <div className="space-y-3">
                  {Object.entries(
                    applications.reduce((acc, app) => {
                      acc[app.place_to_work] = (acc[app.place_to_work] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([location, count]) => {
                      const percentage = (count / applications.length) * 100
                      return (
                        <div key={location}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700">{location}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
