'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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

// Custom marker icon with emerald color
const createCustomIcon = (isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-full">
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 27.5 16 42 16 42C16 42 32 27.5 32 16C32 7.163 24.837 0 16 0Z" fill="${isSelected ? '#0ea5e9' : '#10b981'}"/>
            <circle cx="16" cy="15" r="6" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  })
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function MapSelector({ onLocationSelect }: MapSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.3777, 49.8924])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Set the default Leaflet icon URLs once (client-side)
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl as string,
    iconUrl: iconUrl as string,
    shadowUrl: shadowUrl as string
  } as L.IconOptions)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/locations')
        if (!response.ok) throw new Error(`Failed to load locations`)
        const data = await response.json()
        setLocations(data)
      } catch (err) {
        setError('Məkanlar yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin.')
        console.error('Failed to fetch locations', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  const handleLocationClick = (locationName: string, lat: number, lon: number) => {
    setSelectedLocation(locationName)
    setMapCenter([lat, lon])
    onLocationSelect(locationName)
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolokasiya brauzeriniz tərəfindən dəstəklənmir')
      return
    }

    setGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const userPos: [number, number] = [latitude, longitude]
        setUserLocation(userPos)
        setMapCenter(userPos)
        setGettingLocation(false)
      },
      (error) => {
        setGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Məkan girişi rədd edildi. Zəhmət olmasa məkan icazələrini aktiv edin.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Məkan məlumatı əlçatan deyil.')
            break
          case error.TIMEOUT:
            setLocationError('Məkan sorğusunun vaxtı bitdi.')
            break
          default:
            setLocationError('Məkanınız alınarkən xəta baş verdi.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Məkanlar yüklənir...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center px-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-medium text-lg">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
      {/* Location List */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Mövcud Məkanlar
            </h3>
          </div>

          {/* Find My Location Button */}
          <button
            type="button"
            onClick={getUserLocation}
            disabled={gettingLocation}
            className="w-full mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-md flex items-center justify-center gap-2"
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Axtarılır...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🧭</span>
                <span>Mənim Yerimi Tap</span>
              </>
            )}
          </button>

          {locationError && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg text-orange-700 dark:text-orange-300 text-sm">
              {locationError}
            </div>
          )}

          {userLocation && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-lg animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <span>📍</span>
                <span>Sizin məkanınız xəritədə qeyd olundu</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {locations.map((location, index) => {
              const distance = userLocation && location.latitude && location.longitude
                ? calculateDistance(userLocation[0], userLocation[1], location.latitude, location.longitude)
                : null

              return location.latitude && location.longitude ? (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationClick(location.name ?? '', location.latitude!, location.longitude!)}
                  onMouseEnter={() => setHoveredLocation(location.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 transform ${
                    selectedLocation === location.name
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md scale-[1.02]'
                      : hoveredLocation === location.name
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-[1.01]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{location.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {distance !== null ? (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            📏 {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} uzaqlıqda
                          </span>
                        ) : (
                          'Xəritədə görmək üçün klikləyin'
                        )}
                      </div>
                    </div>
                    {selectedLocation === location.name && (
                      <div className="text-emerald-500 text-xl ml-2">✓</div>
                    )}
                  </div>
                </button>
              ) : null
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '500px', width: '100%' }}
            className="z-0"
          >
            <MapController center={mapCenter} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `
                    <div class="relative animate-pulse">
                      <div class="absolute -translate-x-1/2 -translate-y-1/2">
                        <div class="relative">
                          <div class="absolute w-8 h-8 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
                          <div class="relative w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <div class="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              >
                <Popup>
                  <div className="p-2 text-center">
                    <div className="font-bold text-blue-600 mb-1">📍 Siz buradasınız</div>
                    <div className="text-xs text-gray-600">Sizin hazırki məkanınız</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Location Markers */}
            {locations.map((location, index) =>
              location.latitude && location.longitude ? (
                <Marker
                  key={index}
                  position={[location.latitude, location.longitude]}
                  icon={createCustomIcon(selectedLocation === location.name)}
                  eventHandlers={{
                    mouseover: () => setHoveredLocation(location.name),
                    mouseout: () => setHoveredLocation(null),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="font-bold text-lg mb-2 text-gray-800">{location.name}</div>
                      {userLocation && (
                        <div className="text-xs text-blue-600 mb-3 font-medium">
                          📏 {(() => {
                            const dist = calculateDistance(userLocation[0], userLocation[1], location.latitude!, location.longitude!)
                            return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`
                          })()} sizdən
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleLocationClick(location.name ?? '', location.latitude!, location.longitude!)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        {selectedLocation === location.name ? '✓ Seçildi' : 'Bu Məkanı Seç'}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
        {selectedLocation && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <span className="text-xl">✓</span>
              <span className="font-semibold">Seçildi: {selectedLocation}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
