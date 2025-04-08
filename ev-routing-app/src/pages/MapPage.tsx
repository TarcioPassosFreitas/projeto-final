import React, { useState } from 'react';
import ConfirmationModal from '../components/molecules/ConfirmationModal';
import MapFrame from '../components/organisms/MapFrame';

const MapPage: React.FC = () => {
  const [selectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleConfirm = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="relative bg-parallax min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10">
        <MapFrame />
        <ConfirmationModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
          title="Confirmar Destino"
          message={`Deseja navegar para ${selectedPlace?.name}?`}
        />
      </div>
    </main>
  );
};

export default MapPage;
