import { Circle, Search } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'

interface Prediction {
  description: string
  place_id: string
}

export interface GooglePlacesSearchRef {
  clearInput: () => void
}

interface GooglePlacesSearchProps {
  onSelectPlace: (placeId: string, description: string) => void
  status: 'idle' | 'pending' | 'confirmed'
  hideSuggestions?: boolean
}

const GooglePlacesSearch = forwardRef<GooglePlacesSearchRef, GooglePlacesSearchProps>(
  ({ onSelectPlace, status, hideSuggestions }, ref) => {
    const [input, setInput] = useState('')
    const [predictions, setPredictions] = useState<Prediction[]>([])
    const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null)

    useEffect(() => {
      if (!serviceRef.current && window.google) {
        serviceRef.current = new window.google.maps.places.AutocompleteService()
      }
    }, [])

    useEffect(() => {
      if (!input || !serviceRef.current) {
        setPredictions([])
        return
      }

      serviceRef.current.getPlacePredictions({ input }, (results) => {
        setPredictions(results || [])
      })
    }, [input])

    useImperativeHandle(ref, () => ({
      clearInput: () => {
        setInput('')
        setPredictions([])
      }
    }))

    const circleClasses = {
      idle: 'text-neutral-400',
      pending: 'text-yellow-400 fill-yellow-400',
      confirmed: 'text-green-500 fill-green-500'
    }

    return (
      <div className="relative w-[320px] z-30">
        {/* Input com ícones */}
        <div className="flex items-center bg-neutral-900/70 backdrop-blur-lg px-4 py-2 rounded-full shadow-lg">
          <Search size={20} className="text-neutral-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-neutral-300 placeholder-neutral-400 text-sm px-2 outline-none flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Circle size={18} className={`transition-all ${circleClasses[status]}`} />
        </div>

        {/* Sugestões */}
        {!hideSuggestions && predictions.length > 0 && (
          <ul className="absolute w-full mt-1 rounded-xl bg-black/80 shadow-lg border border-cyan-400/20 z-40 overflow-hidden max-h-60 overflow-y-auto">
            {predictions.map((p) => (
              <li
                key={p.place_id}
                onClick={() => {
                  onSelectPlace(p.place_id, p.description)
                  setInput(p.description)
                  setPredictions([])
                }}
                className="px-4 py-2 cursor-pointer hover:bg-cyan-500/10 text-white"
              >
                {p.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)

export default GooglePlacesSearch
