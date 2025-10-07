'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

interface Application {
  id: number
  name: string
  surname: string
  phone: string
  current_living_place: string
  place_to_work: string
  job_title: string
  expected_salary: number
  info: string | null
  created_at: string
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
  const itemsPerPage = 5

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
    // Prepare data for export
    const exportData = filteredApplications.map((app) => ({
      ID: app.id,
      Ad: app.name,
      Soyad: app.surname,
      Telefon: app.phone,
      'Hazırki yaşayış yeri': app.current_living_place,
      'İş yeri': app.place_to_work,
      'Vəzifə': app.job_title,
      'Gözlənilən maaş (AZN)': app.expected_salary,
      'Əlavə məlumat': app.info || '',
      'Müraciət tarixi': new Date(app.created_at).toLocaleString(),
    }))

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // ID
      { wch: 15 }, // Name
      { wch: 15 }, // Surname
      { wch: 15 }, // Phone
      { wch: 20 }, // Current Living Place
      { wch: 20 }, // Preferred Work Location
      { wch: 15 }, // Job Title
      { wch: 12 }, // Expected Salary
      { wch: 30 }, // Additional Info
      { wch: 20 }, // Applied Date
    ]

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Müraciətlər')

    // Generate file name with current date
    const fileName = `is_muracietleri_${new Date().toISOString().split('T')[0]}.xlsx`

    // Export file
    XLSX.writeFile(wb, fileName)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation =
      filterLocation === '' || app.place_to_work === filterLocation

    return matchesSearch && matchesLocation
  })

  const uniqueLocations = Array.from(
    new Set(applications.map((app) => app.place_to_work))
  ).sort()

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplications = filteredApplications.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterLocation])

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                İdarəetmə Paneli
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Daxil olmaq üçün məlumatlarınızı daxil edin</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  İstifadəçi adı
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  placeholder="İstifadəçi adınızı daxil edin"
                  required
                  disabled={loggingIn}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Şifrə
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  placeholder="Şifrənizi daxil edin"
                  required
                  disabled={loggingIn}
                />
              </div>

              {loginError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-600 hover:via-teal-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl"
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium text-lg">
            Müraciətlər yüklənir...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Məlumat Yüklənmə Xətası
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchApplications}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Yenidən Cəhd Et
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    İdarəetmə Paneli
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ümumi Müraciətlər: <span className="font-bold text-emerald-600">{applications.length}</span>
                    {filteredApplications.length !== applications.length && (
                      <span className="ml-2 text-sm">
                        (Göstərilir {filteredApplications.length})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={exportToExcel}
                    disabled={filteredApplications.length === 0}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📊</span>
                    <span>Excel-ə Köçür</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    title="Çıxış"
                  >
                    🚪 Çıxış
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-4 py-2 font-semibold transition-all duration-200 border-b-2 ${
                    activeTab === 'applications'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-emerald-500'
                  }`}
                >
                  📋 Müraciətlər
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 font-semibold transition-all duration-200 border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-emerald-500'
                  }`}
                >
                  📈 Analitika
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ümumi Müraciətlər</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{applications.length}</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Orta Maaş</div>
                </div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(applications.reduce((sum, app) => sum + app.expected_salary, 0) / applications.length || 0)} AZN
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unikal Məkanlar</div>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(applications.map(app => app.place_to_work)).size}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Vəzifə Növləri</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {new Set(applications.map(app => app.job_title)).size}
                </div>
              </div>
            </div>

            {/* Job Titles Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span>💼</span>
                Vəzifələrə görə Bölgü
              </h3>
              <div className="space-y-3">
                {Object.entries(
                  applications.reduce((acc, app) => {
                    acc[app.job_title] = (acc[app.job_title] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([title, count]) => {
                    const percentage = (count / applications.length) * 100
                    return (
                      <div key={title}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span>📍</span>
                Məkanlara görə Bölgü (Top 10)
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
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{location}</span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Salary Range Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span>💵</span>
                Maaş Aralığı Bölgüsü
              </h3>
              <div className="space-y-3">
                {(() => {
                  const ranges = {
                    '500-700 AZN': applications.filter(app => app.expected_salary >= 500 && app.expected_salary < 700).length,
                    '700-900 AZN': applications.filter(app => app.expected_salary >= 700 && app.expected_salary < 900).length,
                    '900-1100 AZN': applications.filter(app => app.expected_salary >= 900 && app.expected_salary < 1100).length,
                    '1100+ AZN': applications.filter(app => app.expected_salary >= 1100).length,
                  }
                  return Object.entries(ranges).map(([range, count]) => {
                    const percentage = (count / applications.length) * 100
                    return (
                      <div key={range}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{range}</span>
                          <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {activeTab === 'applications' && (
        <>
        <div className="mb-6 animate-slideUp">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  🔍 Axtar
                </label>
                <input
                  type="text"
                  placeholder="Ad, telefon və ya vəzifə üzrə axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                />
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📍 Məkan üzrə filter
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
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

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slideUp">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Müraciət Tapılmadı
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {applications.length === 0
                  ? 'Hələ heç bir müraciət edilməyib.'
                  : 'Axtarış və ya filter kriteriyalarını dəyişdirməyi cəhd edin.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <tr>
                      <th className="py-4 px-6 text-left font-bold text-base">Ad Soyad</th>
                      <th className="py-4 px-6 text-left font-bold text-base">Telefon</th>
                      <th className="py-4 px-6 text-left font-bold text-base">Yaşayış Yeri</th>
                      <th className="py-4 px-6 text-left font-bold text-base">İş Yeri</th>
                      <th className="py-4 px-6 text-left font-bold text-base">Vəzifə</th>
                      <th className="py-4 px-6 text-left font-bold text-base">Maaş</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentApplications.map((app, index) => (
                      <tr
                        key={app.id}
                        className={`hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                        }`}
                      >
                        <td className="py-5 px-6 text-gray-800 dark:text-gray-200">
                          <div className="font-semibold text-base">{app.name} {app.surname}</div>
                        </td>
                        <td className="py-5 px-6 text-gray-700 dark:text-gray-300 font-medium">
                          {app.phone}
                        </td>
                        <td className="py-5 px-6 text-gray-700 dark:text-gray-300">
                          {app.current_living_place}
                        </td>
                        <td className="py-5 px-6">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {app.place_to_work}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-gray-700 dark:text-gray-300 font-medium">
                          {app.job_title}
                        </td>
                        <td className="py-5 px-6 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                          {app.expected_salary} AZN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Göstərilir <span className="font-semibold text-gray-900 dark:text-gray-100">{startIndex + 1}</span> - {' '}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {Math.min(endIndex, filteredApplications.length)}
                      </span>{' '}
                      / <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredApplications.length}</span> müraciət
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        ← Əvvəlki
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Növbəti →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Stats */}
        {filteredApplications.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Orta Maaş</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(
                  filteredApplications.reduce((sum, app) => sum + app.expected_salary, 0) /
                    filteredApplications.length
                )}{' '}
                AZN
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ən Populyar Vəzifə</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                {Object.entries(
                  filteredApplications.reduce((acc, app) => {
                    acc[app.job_title] = (acc[app.job_title] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ən Çox Tələb Olunan Məkan</div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 truncate">
                {Object.entries(
                  filteredApplications.reduce((acc, app) => {
                    acc[app.place_to_work] = (acc[app.place_to_work] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
