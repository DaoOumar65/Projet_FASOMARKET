import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GuideVendeur from '../components/GuideVendeur';

export default function GuideVendeurPage() {
  // Récupérer les données du vendeur depuis le localStorage ou l'API
  const statutCompte = 'VALIDATED'; // Par défaut validé puisqu'on arrive ici
  const boutique = null; // À récupérer depuis l'API si nécessaire

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Bouton retour */}
        <Link
          to="/vendeur/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'white',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}
        >
          <ArrowLeft size={16} />
          Retour au dashboard
        </Link>

        {/* Guide vendeur */}
        <GuideVendeur statutCompte={statutCompte} boutique={boutique} />
      </div>
    </div>
  );
}