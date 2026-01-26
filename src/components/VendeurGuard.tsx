import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
            setDebugInfo('Compte validé, vérification boutique...');
            // Permettre l'accès direct au guide
            const currentPath = window.location.pathname;
            if (currentPath === '/vendeur/guide') {
              setIsLoading(false);
              return;
            }
            
            // Vérifier le statut de la boutique pour les autres pages
            try {
              const boutiqueResponse = await vendorService.getBoutique();
              const data = boutiqueResponse.data;
              
              setDebugInfo(`Réponse boutique: ${JSON.stringify(data)}`);
              
              // Nouveau format: {boutique: null, message: "..."} ou directement la boutique
              if (data.boutique === null || !data.id) {
                setDebugInfo('Pas de boutique - redirection vers création');
                // SEULEMENT rediriger si on n'est pas déjà sur une page de création
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/creer-boutique')) {
                  navigate('/vendeur/creer-boutique-status');
                }
              } else {
                const boutique = data.boutique || data;
                setDebugInfo(`Boutique trouvée: ${boutique.statut}`);
                switch (boutique.statut) {
                  case StatutBoutique.BROUILLON:
                    navigate('/vendeur/completer-boutique');
                    break;
                  case StatutBoutique.EN_ATTENTE_APPROBATION:
                    navigate('/vendeur/boutique-en-attente');
                    break;
                  case StatutBoutique.REJETEE:
                    navigate('/vendeur/boutique-rejetee');
                    break;
                  case StatutBoutique.ACTIVE:
                    // Continuer normalement
                    break;
                }
              }
            } catch (error: any) {
              setDebugInfo(`Erreur boutique: ${error.response?.status}`);
              // Erreur 400 = pas de boutique (backend pas encore fixé)
              if (error.response?.status === 400) {
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/creer-boutique')) {
                  navigate('/vendeur/creer-boutique-status');
                }
              } else {
                console.error('Erreur API boutique:', error);
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/creer-boutique')) {
                  navigate('/vendeur/creer-boutique-status');
                }
              }
            }
            break;
        }
      } catch (error: any) {
        setDebugInfo(`Erreur statut: ${error.code || error.message}`);
        console.error('Erreur lors de la vérification du statut:', error);
        
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