'use client'

import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

export const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
export const GMAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

let configured = false

export function mapsAvailable(): boolean {
  return !!GMAPS_KEY
}

async function ensure() {
  if (!GMAPS_KEY) throw new Error('NO_MAPS_KEY')
  if (!configured) {
    setOptions({ key: GMAPS_KEY, v: 'weekly' })
    configured = true
  }
}

export async function loadMapsLib(name: 'maps'): Promise<google.maps.MapsLibrary>
export async function loadMapsLib(name: 'places'): Promise<google.maps.PlacesLibrary>
export async function loadMapsLib(name: 'routes'): Promise<google.maps.RoutesLibrary>
export async function loadMapsLib(name: 'geometry'): Promise<google.maps.GeometryLibrary>
export async function loadMapsLib(name: 'marker'): Promise<google.maps.MarkerLibrary>
export async function loadMapsLib(name: string): Promise<unknown> {
  await ensure()
  return importLibrary(name)
}

// Estilo escuro alinhado ao app esportivo SOMMA.
export const DARK_SOMMA_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9aa0a6' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e2233' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#444444' }] },
]
