'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MapSelector = dynamic(() => import('./components/MapSelector'), {
  ssr: false,
})

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    currentLivingPlace: '',
    placeToWork: '',
    jobTitle: '',
    expectedSalary: '',
    info: '',
  })
  const [showMap, setShowMap] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleLocationSelect = (locationName: string) => {
    setFormData({ ...formData, placeToWork: locationName })
    setShowMap(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      console.log(data)

      if (response.ok) {
        // Redirect directly to oba.az without alert
        window.location.href = 'https://oba.az/'
      } else {
        alert('Müraciət göndərilmədi. Zəhmət olmasa yenidən cəhd edin.')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start sm:justify-center p-3 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 animate-fadeIn pt-4 sm:pt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Bizim Oba
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">Komandamıza Qoşulun</p>
        </div>
      <form className="w-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-100 dark:border-gray-700 animate-slideUp" onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
          <div className="w-full md:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6 md:mb-0">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="name">
              Ad
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="name" type="text" placeholder="Ayşə" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="w-full md:w-1/2 px-2 sm:px-3">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="surname">
              Soyad
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="surname" type="text" placeholder="Məmmədova" value={formData.surname} onChange={handleChange} required />
          </div>
        </div>
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
          <div className="w-full px-2 sm:px-3">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="phone">
              Telefon
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="phone" type="tel" placeholder="+994 50 555 55 55" value={formData.phone} onChange={handleChange} required />
          </div>
        </div>
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
          <div className="w-full px-2 sm:px-3">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="currentLivingPlace">
              Hazırki yaşayış yeri
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="currentLivingPlace" type="text" placeholder="Bakı, Azərbaycan" value={formData.currentLivingPlace} onChange={handleChange} required />
          </div>
        </div>
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
          <div className="w-full px-2 sm:px-3">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="placeToWork">
              İş yeri
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 mb-3 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="placeToWork" type="text" placeholder="İşləmək istədiyiniz marketi seçin" value={formData.placeToWork} readOnly required />
            <button type="button" onClick={() => setShowMap(!showMap)} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 shadow-md">
              {showMap ? '✕ Xəritəni Gizlət' : '📍 Xəritədən Seç'}
            </button>
          </div>
        </div>
        {showMap && (
          <div className="mb-4 sm:mb-6">
            <MapSelector onLocationSelect={handleLocationSelect} />
          </div>
        )}
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
          <div className="w-full md:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6 md:mb-0">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="jobTitle">
              Vəzifə
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="jobTitle" type="text" placeholder="Kassir" value={formData.jobTitle} onChange={handleChange} required />
          </div>
          <div className="w-full md:w-1/2 px-2 sm:px-3">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="expectedSalary">
              Gözlənilən maaş (AZN)
            </label>
            <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="expectedSalary" type="number" placeholder="500" value={formData.expectedSalary} onChange={handleChange} required />
          </div>
        </div>
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
          <div className="w-full px-2 sm:px-3">
            <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="info">
              Əlavə məlumat
            </label>
            <textarea className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[100px] sm:min-h-[120px] resize-y" id="info" placeholder="Özünüz haqqında, təcrübəniz və niyə komandamıza qoşulmaq istədiyiniz barədə bizə məlumat verin..." value={formData.info} onChange={handleChange}></textarea>
          </div>
        </div>
        <div className="flex flex-wrap -mx-2 sm:-mx-3 mt-6 sm:mt-8">
            <div className="w-full px-2 sm:px-3">
                <button className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-600 hover:via-teal-700 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300 transform active:scale-95 sm:hover:scale-[1.02] shadow-xl hover:shadow-2xl" type="submit">
                    Müraciəti Göndər
                </button>
            </div>
        </div>
      </form>
      </div>
    </main>
  );
}