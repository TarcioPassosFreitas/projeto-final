import { motion } from 'framer-motion'
import type { Map as LeafletMap } from 'leaflet'
import L, { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle,
  LocateFixed,
  Minus,
  Plus,
  Zap
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip
} from 'react-leaflet'
import { FuelStation, getFuelStationsAlongRoute } from '../../services/fuelStations'
import { reverseGeocode } from '../../services/geocode'
import { getPlaceDetails } from '../../services/google'
import { sendMessage } from '../../services/protocolService'
import { getRouteFromORS } from '../../services/route'
import { VITE_USE_MOCK } from '../../utils/constants'
import { wait } from '../../utils/wait'
import CancelRouteModal from '../molecules/CancelRouteModal'
import ConfirmationModal from '../molecules/ConfirmationModal'
import GooglePlacesSearch, { GooglePlacesSearchRef } from '../molecules/GooglePlacesSearch'
import NearestStationModal from '../molecules/NearestStationModal'
import SuccessNavigationModal from '../molecules/SuccessNavigationModal'



export default function FuturisticMapFrame() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [mapReady, setMapReady] = useState(false)
  const [currentPos] = useState<LatLngTuple>([-12.262, -38.957])
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [pendingPlaceId, setPendingPlaceId] = useState<string | null>(null)
  const [pendingPlaceName, setPendingPlaceName] = useState<string>('')
  const [confirming, setConfirming] = useState<'idle' | 'pending' | 'confirmed'>('idle')
  const [routePoints, setRoutePoints] = useState<LatLngTuple[]>([])
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([])
  const [originLabel, setOriginLabel] = useState('')
  const [destinationLabel, setDestinationLabel] = useState('')
  const [autonomy, setAutonomy] = useState<number | null>(null)
  const [warningMessage, setWarningMessage] = useState('')
  const [showWarningModal, setShowWarningModal] = useState(false)

  const mapRef = useRef<LeafletMap | null>(null)
  const searchRef = useRef<GooglePlacesSearchRef | null>(null)

  const [showStationChoiceModal, setShowStationChoiceModal] = useState(false)
  const [selectedStationName, setSelectedStationName] = useState('')
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [, setShowTowingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)



  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 5
        if (next >= 100) {
          clearInterval(interval)
          setLoading(false)
          setTimeout(() => setMapReady(true), 100)
        }
        return next >= 100 ? 100 : next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleRecenter = () => {
    const zoom = mapRef.current?.getZoom()
    if (mapRef.current && zoom !== undefined) {
      mapRef.current.setView(currentPos, zoom)
    }
  }

  const handleSelectPlace = (placeId: string, description: string) => {
    setPendingPlaceId(placeId)
    setPendingPlaceName(description)
    setModalOpen(true)
    setConfirming('pending')
  }

  const handleConfirm = async () => {
    if (!pendingPlaceId) return
    const details = await getPlaceDetails(pendingPlaceId)
    if (details) {
      const end: [number, number] = [details.lat, details.lng]
      const start: [number, number] = [currentPos[0], currentPos[1]]

      const route = await getRouteFromORS(start, end)
      const cleanedRoute = route.map(([lat, lng]) => [lat, lng] as [number, number])

      setRoutePoints(cleanedRoute)
      setConfirming('confirmed')

      const [startLabel, endLabel] = await Promise.all([
        reverseGeocode(start[0], start[1]),
        reverseGeocode(end[0], end[1])
      ])
      setOriginLabel(startLabel)
      setDestinationLabel(endLabel)

      await wait(1000)

      const userId = localStorage.getItem('user_id')
      if (!userId) {
        console.error('[ERRO] user_id não encontrado no localStorage!')
        return
      }

      const distanceKm = cleanedRoute.length * 0.03
      const navResponse = await sendMessage('NAVIGATION', {
        user_id: userId,
        route_distance: Number(distanceKm.toFixed(2))
      })

      if (!navResponse?.data?.can_complete) {
        setWarningMessage(navResponse.data.message)
        setAutonomy(navResponse.data.autonomy)
        setShowWarningModal(true)
      } else {
        setWarningMessage('Você conseguirá chegar ao destino com sua autonomia atual. Boa viagem!')
        setAutonomy(navResponse.data.autonomy)
        setShowSuccessModal(true)
        searchRef.current?.clearInput()
        setModalOpen(false)
        return
      }



      await wait(1000)

      let stations: FuelStation[] = []
      if (VITE_USE_MOCK) {
        const stored = localStorage.getItem('mock_stations')
        if (stored) {
          const parsed = JSON.parse(stored)
          stations = Object.entries(parsed).map(([id, value]: [string, any]) => ({
            id: Number(id),
            name: value.name_station,
            address: value.address,
            lat: value.latitude,
            lon: value.longitude
          }))
        }
      } else {
        stations = await getFuelStationsAlongRoute(cleanedRoute)
      }

      setFuelStations(stations)

      const list_stations = Object.fromEntries(
        stations.map((station) => {
          const dist = Math.sqrt(
            Math.pow(station.lat - currentPos[0], 2) +
            Math.pow(station.lon - currentPos[1], 2)
          ) * 111
          return [station.id, { distance_origin_position: Number(dist.toFixed(2)) }]
        })
      )

      const selectionResponse = await sendMessage('SELECTION_STATION', {
        user_id: userId,
        list_stations
      })

      console.log('[DEBUG] RESPOSTA SELECTION_STATION:', selectionResponse)

      if (selectionResponse?.status?.code === 404) {
        setWarningMessage(selectionResponse?.data?.message || 'Posto de recarga indisponível.')
        setShowWarningModal(true)
        setRoutePoints([])
        setFuelStations([])
        setConfirming('idle')
        setOriginLabel('')
        setDestinationLabel('')
        searchRef.current?.clearInput()
        return
      }

      if (selectionResponse?.status?.code === 200 && selectionResponse?.data?.id_station === null) {
        setWarningMessage(selectionResponse.data.message || 'Nenhum posto disponível.')
        setShowTowingModal(true)
        localStorage.removeItem('user_id')
        return
      }

      const selectedId = selectionResponse?.data?.id_station
      if (selectedId && stations.length > 0) {
        const selectedStation = stations.find((s) => String(s.id) === String(selectedId))
        if (selectedStation) {
          setSelectedStationId(selectedId)
          setSelectedStationName(selectedStation.name || '')
          setShowStationChoiceModal(true)
        }
      }

      searchRef.current?.clearInput()
    }
    setModalOpen(false)
  }

  const handleCancelRoute = () => setCancelModalOpen(true)

  const confirmCancelRoute = () => {
    setRoutePoints([])
    setFuelStations([])
    setConfirming('idle')
    setOriginLabel('')
    setDestinationLabel('')
    searchRef.current?.clearInput()
    setCancelModalOpen(false)
  }

  const handleRejectStation = () => {
    setShowStationChoiceModal(false)
    setShowTowingModal(true)
    localStorage.removeItem('user_id')
  }



  return (
    <div className="min-h-screen bg-parallax flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black/60 z-0" />
      <div className="relative w-[360px] h-[680px] rounded-[60px] border-[15px] border-neutral-900 bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_6px_15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[320px]">
          <GooglePlacesSearch
            onSelectPlace={handleSelectPlace}
            status={confirming}
            ref={searchRef}
          />
        </div>
        <div className="relative flex-1 overflow-hidden">
          {mapReady && (
            <MapContainer
              center={currentPos}
              zoom={13}
              className="h-full w-full z-10"
              zoomControl={false}
              ref={mapRef}
            >
              <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
              <Marker position={currentPos}>
                <Tooltip>{originLabel || 'Sua localização'}</Tooltip>
              </Marker>
              {routePoints.length > 0 && (
                <>
                  <Marker position={routePoints[routePoints.length - 1]}>
                    <Tooltip>{destinationLabel || 'Destino'}</Tooltip>
                  </Marker>
                  <Polyline positions={routePoints} color="orange" weight={6} />
                </>
              )}
              {fuelStations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lon]}
                  icon={L.divIcon({
                    className: 'custom-fuel-icon',
                    html: `<div style="color: orange; font-size: 18px;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M13 6V3a1 1 0 1 0-2 0v3H9a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2Zm-2 2h2v6h-2V8Zm0 8h2v2h-2v-2Z"/></svg></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                  })}
                >
                  <Tooltip>{station.name}</Tooltip>
                </Marker>
              ))}
            </MapContainer>
          )}

          {mapReady && (
            <>
              <div className="absolute bottom-32 right-4 flex flex-col gap-2 z-30">
                <button onClick={() => mapRef.current?.zoomIn()} className="bg-neutral-900/70 rounded-xl p-2 shadow-lg text-neutral-300">
                  <Plus size={16} />
                </button>
                <button onClick={() => mapRef.current?.zoomOut()} className="bg-neutral-900/70 rounded-xl p-2 shadow-lg text-neutral-300">
                  <Minus size={16} />
                </button>
              </div>
              <button onClick={handleRecenter} className="absolute bottom-32 left-4 bg-neutral-900/70 rounded-xl p-2 shadow-lg text-neutral-300 z-30">
                <LocateFixed size={16} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[320px] px-4 z-30">
            <div className="flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-lg rounded-[24px] shadow-lg px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="text-neutral-100 text-lg font-semibold">Map</span>
                <Zap className="text-orange-400" size={18} />
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-[4px] mt-3 overflow-hidden">
                {loading ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 2 }}
                    className="h-full bg-gradient-to-r from-transparent via-orange-600 to-orange-400 shadow-lg"
                  />
                ) : (
                  <div className="h-full bg-neutral-800" />
                )}
              </div>
              {routePoints.length > 0 && (
                <button
                  onClick={handleCancelRoute}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-full shadow-md hover:brightness-110 transition"
                >
                  Cancel Route
                </button>
              )}
            </div>
          </div>

          <ConfirmationModal
            isOpen={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            onConfirm={handleConfirm}
            title="Confirmar destino"
            message={`Deseja navegar para: ${pendingPlaceName}?`}
          />

          <CancelRouteModal
            isOpen={cancelModalOpen}
            onCancel={() => setCancelModalOpen(false)}
            onConfirm={confirmCancelRoute}
          />

          {showWarningModal && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
              <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-[300px] text-center">
                <AlertTriangle className="text-yellow-400 mx-auto mb-4" size={40} />
                <p className="text-white mb-2 font-semibold">{warningMessage}</p>
                {autonomy !== null && <p className="text-neutral-300 text-sm">Autonomia atual: {autonomy} km</p>}
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full"
                >
                  Entendi
                </button>
              </div>
            </div>
          )}

          <NearestStationModal
            isOpen={showStationChoiceModal}
            stationName={selectedStationName}
            onConfirm={async () => {
              setShowStationChoiceModal(false);

              const user_id = localStorage.getItem('user_id') || '';
              const id_station = selectedStationId;

              const response = await sendMessage('PAYMENT', {
                user_id,
                id_station,
                confirmation: true,
              });

              if (response?.status?.code === 200 && response.data.confirmation) {
                const mockStations = JSON.parse(localStorage.getItem('mock_stations') || '{}');
                const posto = mockStations[id_station!];
                const pos: LatLngTuple = [posto.latitude, posto.longitude];

                const newRoute = await getRouteFromORS(currentPos, pos);
                const cleanedNewRoute = newRoute.map(([lat, lng]) => [lat, lng] as [number, number]);

                setRoutePoints(cleanedNewRoute);
                setDestinationLabel(posto.name_station);
              } else {
                setShowTowingModal(true);
                localStorage.removeItem('user_id');
              }
            }}
            onReject={handleRejectStation}
          />
          <SuccessNavigationModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            message={warningMessage}
          />
        </div>
      </div>
    </div>
  )
}