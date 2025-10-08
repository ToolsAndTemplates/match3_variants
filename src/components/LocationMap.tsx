'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
const DefaultIcon = L.Icon.Default.prototype as unknown as { _getIconUrl?: string }
delete DefaultIcon._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  id: number
  latitude: number
  longitude: number
  name: string
}

interface LocationMapProps {
  onLocationSelect: (locationName: string) => void
  selectedLocation: string
}

// Custom orange marker icon
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${isSelected ? '#ea580c' : '#f97316'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function MapUpdater({ locations, selectedLocation }: { locations: Location[], selectedLocation: string }) {
  const map = useMap()

  useEffect(() => {
    if (locations.length > 0) {
      const selectedLoc = locations.find(loc => loc.name === selectedLocation)

      if (selectedLoc) {
        // Center map on selected location
        map.setView([selectedLoc.latitude, selectedLoc.longitude], 13, {
          animate: true,
        })
      } else {
        // Default to Azerbaijan center
        const bounds = L.latLngBounds(
          locations.map(loc => [loc.latitude, loc.longitude] as L.LatLngTuple)
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [map, locations, selectedLocation])

  return null
}

export default function LocationMap({ onLocationSelect, selectedLocation }: LocationMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Xəritə yüklənir...</p>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Məkan məlumatları tapılmadı</p>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
      <MapContainer
        center={[40.4093, 49.8671]} // Baku coordinates
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater locations={locations} selectedLocation={selectedLocation} />

        {locations.map((location) => {
          const isSelected = location.name === selectedLocation

          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createCustomIcon(isSelected)}
              eventHandlers={{
                click: () => {
                  onLocationSelect(location.name)
                },
              }}
            >
              <Popup>
                <div className="text-center p-2">
                  <h3 className="font-bold text-gray-900 mb-1">{location.name}</h3>
                  <button
                    onClick={() => onLocationSelect(location.name)}
                    className="mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Seç
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
