import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface AdresseMapSimpleProps {
  adresse: string;
  latitude?: number;
  longitude?: number;
  nom?: string;
}

const AdresseMapSimple: React.FC<AdresseMapSimpleProps> = ({ 
  adresse, 
  latitude, 
  longitude, 
  nom = "Localisation"
}) => {

  const handleMapsClick = () => {
    alert('Test clic Maps - Adresse: ' + adresse);
    
    let url = 'https://www.google.com/maps/search/';
    if (latitude && longitude) {
      url += `${latitude},${longitude}`;
    } else {
      url += encodeURIComponent(`${adresse}, Burkina Faso`);
    }
    
    window.open(url, '_blank');
  };

  const handleItineraireClick = () => {
    alert('Test clic Itinéraire - Adresse: ' + adresse);
    
    let destination = '';
    if (latitude && longitude) {
      destination = `${latitude},${longitude}`;
    } else {
      destination = encodeURIComponent(`${adresse}, Burkina Faso`);
    }
    
    const url = `https://www.google.com/maps/dir//${destination}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: '#f8fafc',
      margin: '10px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <MapPin size={16} color="#2563eb" />
        <div>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>
            {nom}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {adresse}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleMapsClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          🗺️ Voir sur Maps
        </button>

        <button
          onClick={handleItineraireClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          🧭 Itinéraire
        </button>
      </div>
    </div>
  );
};

export default AdresseMapSimple;