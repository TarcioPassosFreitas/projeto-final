import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ServerIPPrompt from './components/molecules/ServerIPPrompt'
import CarSelectionPage from './pages/CarSelectionPage'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <BrowserRouter>
      <ServerIPPrompt />
      <Routes>
        <Route path="/" element={<CarSelectionPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  )
}
