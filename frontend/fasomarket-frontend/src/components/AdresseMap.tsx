import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface AdresseMapProps {
  adresse: string;
  latitude?: number;
  longitude?: number;
  nom?: string;
  showItineraire?: boolean;
}

const AdresseMap: React.FC<AdresseMapProps> = ({ 
  adresse, 
  latitude, 
  longitude, 
  nom = "Localisation",
  showItineraire = true 
}) => {
  const [showMap, setShowMap] = useState(false);

  // Ouvrir Google Maps avec l'adresse ou coordonnées
  const ouvrirGoogleMaps = () => {
    console.log('Ouverture Google Maps pour:', adresse);
    let url = 'https://www.google.com/maps/search/';
    
    if (latitude && longitude) {
      url += `${latitude},${longitude}`;
      console.log('Utilisation coordonnées:', latitude, longitude);
    } else {
      url += encodeURIComponent(`${adresse}, Burkina Faso`);
      console.log('Utilisation adresse:', adresse);
    }
    
    console.log('URL générée:', url);
    window.open(url, '_blank');
  };

  // Obtenir l'itinéraire depuis la position actuelle
  const obtenirItineraire = () => {
    console.log('Obtention itinéraire pour:', adresse);
    let destination = '';
    
    if (latitude && longitude) {
      destination = `${latitude},${longitude}`;
    } else {
      destination = encodeURIComponent(`${adresse}, Burkina Faso`);
    }
    
    const url = `https://www.google.com/maps/dir//${destination}`;
    console.log('URL itinéraire:', url);
    window.open(url, '_blank');
  };

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <MapPin size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            color: '#0f172a',
            fontWeight: '500'
          }}>
            {nom}
          </p>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.4'
          }}>
            {adresse}
          </p>
          {latitude && longitude && (
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: '#94a3b8'
            }}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={ouvrirGoogleMaps}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
          }}
        >
          <ExternalLink size={12} />
          Voir sur Maps
        </button>

        {showItineraire && (
          <button
            onClick={obtenirItineraire}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
            }}
          >
            <Navigation size={12} />
            Itinéraire
          </button>
        )}
      </div>
    </div>
  );
};

export default AdresseMap;