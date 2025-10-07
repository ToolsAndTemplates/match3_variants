'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

// image imports -- TypeScript will accept these if you added the declarations above
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png?url'
import iconUrl from 'leaflet/dist/images/marker-icon.png?url'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png?url'

interface Location {
  latitude: number | null
  longitude: number | null
  name: string | null
}

interface MapSelectorProps {
  onLocationSelect: (locationName: string) => void
}

export default function MapSelector({ onLocationSelect }: MapSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])

  // Set the default Leaflet icon URLs once (client-side)
  // mergeOptions exists on L.Icon.Default and expects IconOptions
  // cast to any/appropriate interface only if TypeScript complains about types
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl as string,
    iconUrl: iconUrl as string,
    shadowUrl: shadowUrl as string
  } as L.IconOptions)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setLocations(data)
      } catch (err) {
        console.error('Failed to fetch locations', err)
      }
    }
    fetchLocations()
  }, [])

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
      <MapContainer
        center={[40.3777, 49.8924]}
        zoom={11}
        style={{ height: '500px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) =>
          location.latitude && location.longitude ? (
            <Marker key={index} position={[location.latitude, location.longitude]}>
              <Popup>
                <div className="p-2">
                  <div className="font-semibold text-lg mb-2 text-gray-800">{location.name}</div>
                  <button
                    type="button"
                    onClick={() => onLocationSelect(location.name ?? '')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    Select Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  )
}
