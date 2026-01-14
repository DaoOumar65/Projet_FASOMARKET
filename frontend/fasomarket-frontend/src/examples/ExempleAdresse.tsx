import React from 'react';
import AdresseMap from '../components/AdresseMap';
import { useGeocode } from '../services/geocoding';

// Exemple d'utilisation dans DetailBoutique.tsx
const ExempleUtilisationAdresse: React.FC = () => {
  const adresseBoutique = "Secteur 15, Ouagadougou";
  const { coordonnees, loading } = useGeocode(adresseBoutique);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Localisation de la boutique</h3>
      
      {/* Utilisation simple avec adresse seulement */}
      <AdresseMap 
        adresse={adresseBoutique}
        nom="Fashion Ouaga"
      />

      {/* Utilisation avec coordonnées géocodées */}
      {coordonnees && (
        <div style={{ marginTop: '20px' }}>
          <h4>Avec coordonnées précises :</h4>
          <AdresseMap 
            adresse={adresseBoutique}
            latitude={coordonnees.latitude}
            longitude={coordonnees.longitude}
            nom="Fashion Ouaga (Géolocalisé)"
            showItineraire={true}
          />
        </div>
      )}

      {/* Exemple avec coordonnées fixes (Ouagadougou centre) */}
      <div style={{ marginTop: '20px' }}>
        <h4>Exemple avec coordonnées fixes :</h4>
        <AdresseMap 
          adresse="Place de la Nation, Ouagadougou"
          latitude={12.3714}
          longitude={-1.5197}
          nom="Centre-ville Ouagadougou"
        />
      </div>
    </div>
  );
};

export default ExempleUtilisationAdresse;