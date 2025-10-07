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
    <MapContainer center={[40.3777, 49.8924]} zoom={11} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) =>
        location.latitude && location.longitude ? (
          <Marker key={index} position={[location.latitude, location.longitude]}>
            <Popup>
              <div>
                <div>{location.name}</div>
                <button type="button" onClick={() => onLocationSelect(location.name ?? '')}>
                  Select
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  )
}
