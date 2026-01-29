import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { vendorService } from '../services/api';
import { StatutCompteVendeur, StatutBoutique } from '../types';

const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh' 
  }}>
    <div style={{ 
      width: '48px', 
      height: '48px', 
      border: '2px solid #e5e7eb', 
      borderTop: '2px solid #2563eb', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }}></div>
  </div>
);

export const VendeurGuard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const checkVendeurStatus = async () => {
      if (!user || user.role !== 'VENDOR') {
        setDebugInfo('Utilisateur non vendeur');
        navigate('/connexion');
        return;
      }

      try {
        setDebugInfo('Vérification statut compte...');
        // Vérifier le statut du compte
        const statusResponse = await vendorService.getStatutCompte();
        const { statutCompte } = statusResponse.data;
        
        setDebugInfo(`Statut compte: ${statutCompte}`);

        switch (statutCompte) {
          case StatutCompteVendeur.EN_ATTENTE_VALIDATION:
            navigate('/vendeur/attente-validation');
            break;
          case StatutCompteVendeur.REFUSE:
            navigate('/vendeur/compte-refuse');
            break;
          case StatutCompteVendeur.SUSPENDU:
            navigate('/vendeur/compte-suspendu');
            break;
          case StatutCompteVendeur.COMPTE_VALIDE:
            // Si on est sur /vendeur ou /, rediriger vers dashboard
            if (location.pathname === '/vendeur' || location.pathname === '/') {
              navigate('/vendeur/dashboard', { replace: true });
              return;
            }
            // Sinon, laisser accéder à la page demandée
            break;
        }
      } catch (error: any) {
        setDebugInfo(`Erreur statut: ${error.code || error.message}`);
        console.error('Erreur lors de la vérification du statut:', error);
        
        // Si l'endpoint n'existe pas (404), continuer en mode dégradé
        if (error.response?.status === 404) {
          setDebugInfo('Endpoint statut-compte non implémenté - Mode dégradé');
          console.warn('Endpoint /api/vendeur/statut-compte non implémenté, accès autorisé');
          setIsLoading(false);
          return;
        }
        
        // Si c'est une erreur de connexion (backend non démarré), permettre l'accès en mode dégradé
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('aborted')) {
          setDebugInfo('Backend non accessible - Mode dégradé activé');
          // Permettre l'accès mais avec un avertissement
          console.warn('Backend non accessible, fonctionnement en mode dégradé');
        } else {
          navigate('/vendeur/erreur');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkVendeurStatus();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <LoadingSpinner />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>{debugInfo}</p>
      </div>
    );
  }

  return <Outlet />;
};