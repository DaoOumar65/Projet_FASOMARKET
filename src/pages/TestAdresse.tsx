import React, { useState } from 'react';
import AdresseMap from '../components/AdresseMap';
import AdresseMapSimple from '../components/AdresseMapSimple';

const TestAdresse: React.FC = () => {
  const [adresseTest, setAdresseTest] = useState('Secteur 15, Ouagadougou');

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#0f172a', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        🗺️ Test des Adresses avec Google Maps
      </h1>

      {/* Input pour tester différentes adresses */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#0f172a' }}>
          Tester une adresse personnalisée :
        </h3>
        <input
          type="text"
          value={adresseTest}
          onChange={(e) => setAdresseTest(e.target.value)}
          placeholder="Entrez une adresse au Burkina Faso..."
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '15px'
          }}
        />
        
        <AdresseMapSimple 
          adresse={adresseTest}
          nom="Adresse de test"
        />
      </div>

      {/* Tests avec adresses prédéfinies */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>
          Tests avec adresses du Burkina Faso :
        </h3>

        {/* Test 1: Ouagadougou centre */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#2563eb', marginBottom: '10px' }}>
            1. Centre-ville Ouagadougou (avec coordonnées)
          </h4>
          <AdresseMapSimple 
            adresse="Place de la Nation, Ouagadougou"
            latitude={12.3714}
            longitude={-1.5197}
            nom="Place de la Nation"
          />
        </div>

        {/* Test 2: Secteur populaire */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#2563eb', marginBottom: '10px' }}>
            2. Secteur 15, Ouagadougou (adresse seulement)
          </h4>
          <AdresseMapSimple 
            adresse="Secteur 15, Ouagadougou"
            nom="Quartier résidentiel"
          />
        </div>

        {/* Test 3: Bobo-Dioulasso */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#2563eb', marginBottom: '10px' }}>
            3. Bobo-Dioulasso (avec coordonnées approximatives)
          </h4>
          <AdresseMapSimple 
            adresse="Centre-ville, Bobo-Dioulasso"
            latitude={11.1781}
            longitude={-4.2970}
            nom="Bobo-Dioulasso Centre"
          />
        </div>

        {/* Test 4: Koudougou */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#2563eb', marginBottom: '10px' }}>
            4. Koudougou (adresse seulement)
          </h4>
          <AdresseMapSimple 
            adresse="Centre-ville, Koudougou"
            nom="Koudougou Centre"
          />
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e0f2fe',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #0284c7'
      }}>
        <h3 style={{ color: '#0c4a6e', marginBottom: '15px' }}>
          📋 Instructions de test :
        </h3>
        <ul style={{ color: '#0c4a6e', lineHeight: '1.6' }}>
          <li><strong>Bouton "Voir sur Maps"</strong> : Ouvre Google Maps avec l'adresse</li>
          <li><strong>Bouton "Itinéraire"</strong> : Ouvre Google Maps avec directions depuis votre position</li>
          <li><strong>Test personnalisé</strong> : Modifiez l'adresse dans le champ ci-dessus</li>
          <li><strong>Console</strong> : Ouvrez F12 pour voir les logs de débogage</li>
          <li><strong>Pop-ups</strong> : Autorisez les pop-ups si Google Maps ne s'ouvre pas</li>
        </ul>
      </div>

      {/* Bouton pour revenir à l'accueil */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
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
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default TestAdresse;
