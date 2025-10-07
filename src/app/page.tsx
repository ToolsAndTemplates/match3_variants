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
    const response = await fetch('/api/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    const data = await response.json()
    console.log(data)
    alert('Application submitted successfully!')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Job Application Form</h1>
      <form className="w-full max-w-lg" onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="name" type="text" placeholder="Jane" value={formData.name} onChange={handleChange} />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="surname">
              Surname
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="surname" type="text" placeholder="Doe" value={formData.surname} onChange={handleChange} />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="phone">
              Phone
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="phone" type="tel" placeholder="+994 XX XXX XX XX" value={formData.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="currentLivingPlace">
              Current Living Place
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="currentLivingPlace" type="text" placeholder="Baku, Azerbaijan" value={formData.currentLivingPlace} onChange={handleChange} />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="placeToWork">
              Place Where Want to Work
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="placeToWork" type="text" placeholder="Select from map" value={formData.placeToWork} readOnly />
            <button type="button" onClick={() => setShowMap(!showMap)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {showMap ? 'Hide Map' : 'Select from Map'}
            </button>
          </div>
        </div>
        {showMap && <MapSelector onLocationSelect={handleLocationSelect} />}
        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="jobTitle">
              Job Title
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="jobTitle" type="text" placeholder="Cashier" value={formData.jobTitle} onChange={handleChange} />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="expectedSalary">
              Expected Salary (AZN)
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="expectedSalary" type="number" placeholder="500" value={formData.expectedSalary} onChange={handleChange} />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="info">
              Info
            </label>
            <textarea className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="info" placeholder="Tell us more about yourself" value={formData.info} onChange={handleChange}></textarea>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mt-6">
            <div className="w-full px-3">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                    Apply
                </button>
            </div>
        </div>
      </form>
    </main>
  );
}