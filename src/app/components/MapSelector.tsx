'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

// Fix for default icon issue with webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


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

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await fetch('/api/locations')
      const data = await response.json()
      setLocations(data)
    }
    fetchLocations()
  }, [])

  return (
    <MapContainer center={[40.3777, 49.8924]} zoom={11} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
        location.latitude && location.longitude && (
          <Marker key={index} position={[location.latitude, location.longitude]}>
            <Popup>
              {location.name}
              <br />
              <button onClick={() => onLocationSelect(location.name || '')}>Select</button>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}
