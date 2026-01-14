import { useNavigate } from 'react-router-dom';

export default function DashboardCreationBoutique() {
  const navigate = useNavigate();

  const openGuide = () => {
    // Ouvrir guide vendeur
    console.log('Ouvrir guide vendeur');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
        padding: '48px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
        
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          Félicitations ! Votre compte est validé
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px', 
          marginBottom: '32px' 
        }}>
          Créez maintenant votre boutique pour commencer à vendre
        </p>
        
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '16px' 
          }}>
            Étapes restantes :
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>1️⃣</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>Remplir les informations boutique</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>2️⃣</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>Télécharger les documents légaux</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>3️⃣</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>Attendre la validation admin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>4️⃣</span>
              <span style={{ fontSize: '14px', color: '#374151' }}>Ajouter vos produits</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/vendeur/creer-boutique')}
            style={{
              padding: '14px 28px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
          >
            Créer ma boutique
          </button>
          
          <button
            onClick={openGuide}
            style={{
              padding: '14px 28px',
              backgroundColor: 'transparent',
              color: '#2563eb',
              border: '2px solid #2563eb',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
              (e.target as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.color = '#2563eb';
            }}
          >
            Guide vendeur
          </button>
        </div>
      </div>
    </div>
  );
}