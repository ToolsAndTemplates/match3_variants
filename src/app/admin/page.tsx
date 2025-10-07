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
  const itemsPerPage = 5

  useEffect(() => {
    fetchApplications()
  }, [])

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
              <button
                onClick={exportToExcel}
                disabled={filteredApplications.length === 0}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-xl">📊</span>
                <span>Excel-ə Köçür</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
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
      </div>
    </div>
  )
}
