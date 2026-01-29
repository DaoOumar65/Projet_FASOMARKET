import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PanierProvider from './contexts/PanierContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuthInit } from './hooks/useAuthInit';
import './styles/theme.css';
import './styles/variantes.css';
import Header from './components/Header';
import VendorLayout from './components/VendorLayout';
import AdminLayout from './components/AdminLayout';
import { VendeurGuard } from './components/VendeurGuard';
import ProtectedRoute from './components/ProtectedRoute';
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import InscriptionClient from './pages/InscriptionClient';
import InscriptionVendeur from './pages/InscriptionVendeur';
import DashboardClient from './pages/DashboardClient';
import DashboardVendeur from './pages/DashboardVendeur';
import DashboardAdmin from './pages/DashboardAdmin';
import AdminUtilisateurs from './pages/AdminUtilisateurs';
import AdminValidations from './pages/AdminValidations';
import AdminBoutiques from './pages/AdminBoutiques';
import AdminProduits from './pages/AdminProduits';
import AdminCommandes from './pages/AdminCommandes';
import AdminParametres from './pages/AdminParametres';
import VendeurBoutique from './pages/VendeurBoutique';
import VendeurProduits from './pages/VendeurProduits';
import VendeurCommandes from './pages/VendeurCommandes';
import VendeurCommandesTest from './pages/VendeurCommandesTest';
import RecupererCommandes from './pages/RecupererCommandes';
import RecupererCommandesAPI from './pages/RecupererCommandesAPI';
import VendeurAnalytics from './pages/VendeurAnalytics';
import VendeurParametres from './pages/VendeurParametres';
import VendeurGestionStock from './pages/VendeurGestionStock';
import VendeurGestionLivraison from './pages/VendeurGestionLivraison';
import ModifierProduit from './pages/ModifierProduit';
import PageAttenteValidationCompte from './pages/PageAttenteValidationCompte';
import CreerBoutique from './pages/CreerBoutique';
import DashboardCreationBoutique from './pages/DashboardCreationBoutique';
import AjouterProduit from './pages/AjouterProduit';
import Recherche from './pages/Recherche';
import DetailProduit from './pages/DetailProduit';
import ClientCommandes from './pages/ClientCommandes';
import ClientFavoris from './pages/ClientFavoris';
import ClientAdresses from './pages/ClientAdresses';
import DetailCommande from './pages/DetailCommande';
import PasserCommande from './pages/PasserCommande';
import Commander from './pages/Commander';
import Favoris from './pages/Favoris';
import Adresses from './pages/Adresses';
import ProfilClient from './pages/ProfilClient';
import ProfilVendeur from './pages/ProfilVendeur';
import Notifications from './pages/Notifications';
import GestionStock from './pages/GestionStock';
import AvisProduit from './pages/AvisProduit';
import AnalyticsVendeur from './pages/AnalyticsVendeur';
import Panier from './pages/Panier';
import Commande from './pages/Commande';
import Profil from './pages/Profil';
import Categories from './pages/Categories';
import Boutiques from './pages/Boutiques';
import DetailBoutique from './pages/DetailBoutique';
import Produits from './pages/Produits';
import TestAdresse from './pages/TestAdresse';
import PaiementSimule from './pages/PaiementSimule';
import Paiement from './pages/Paiement';
import PaiementSucces from './pages/PaiementSucces';
import PaiementAnnule from './pages/PaiementAnnule';
import GestionVariantes from './pages/GestionVariantes';
import GuideVendeurPage from './pages/GuideVendeurPage';

function App() {
  useAuthInit();
  
  return (
    <ThemeProvider>
      <PanierProvider>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
        <Routes>
          {/* Routes publiques avec Header */}
          <Route path="/" element={<><Header /><Accueil /></>} />
          <Route path="/test-adresse" element={<><Header /><TestAdresse /></>} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription/client" element={<><Header /><InscriptionClient /></>} />
          <Route path="/inscription/vendeur" element={<><Header /><InscriptionVendeur /></>} />
          <Route path="/inscription" element={<InscriptionClient />} />
          <Route path="/recherche" element={<><Header /><Recherche /></>} />
          <Route path="/produits/:id" element={<><Header /><DetailProduit /></>} />
          <Route path="/produit/:id" element={<><Header /><DetailProduit /></>} />
          <Route path="/categories" element={<><Header /><Categories /></>} />
          <Route path="/categories/:id" element={<><Header /><Categories /></>} />
          <Route path="/boutiques" element={<><Header /><Boutiques /></>} />
          <Route path="/boutiques/:id" element={<><Header /><DetailBoutique /></>} />
          <Route path="/produits" element={<><Header /><Produits /></>} />
          
          {/* Routes protégées Client avec Header */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <DashboardClient />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/panier" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <Panier />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/commande" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <Commande />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/commandes" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <ClientCommandes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/commandes/:id" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <DetailCommande />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/commande/:id" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <DetailCommande />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/commander" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <Commander />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favoris" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <Favoris />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/adresses" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <Adresses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/profil" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <ProfilClient />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Header />
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/produits/:id/avis" 
            element={
              <>
                <Header />
                <AvisProduit />
              </>
            } 
          />
          <Route 
            path="/profil" 
            element={
              <ProtectedRoute>
                <Header />
                <Profil />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/paiement/:commandeId" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <Paiement />
              </ProtectedRoute>
            } 
          />
          <Route path="/paiement/succes" element={<><Header /><PaiementSucces /></>} />
          <Route path="/paiement/annule" element={<><Header /><PaiementAnnule /></>} />
          
          {/* Routes protégées Vendeur avec VendorLayout */}
          <Route path="/vendeur/*" element={<VendeurGuard />}>
            {/* Pages de statut */}
            <Route path="attente-validation" element={<PageAttenteValidationCompte />} />
            <Route path="creer-boutique-status" element={<DashboardCreationBoutique />} />
            <Route path="creer-boutique" element={<CreerBoutique />} />
            <Route path="guide" element={<GuideVendeurPage />} />
            
            {/* Dashboard avec layout */}
            <Route path="*" element={<VendorLayout />}>
              <Route path="dashboard" element={<DashboardVendeur />} />
              <Route path="boutique" element={<VendeurBoutique />} />
              <Route path="produits" element={<VendeurProduits />} />
              <Route path="produits/:id/modifier" element={<ModifierProduit />} />
              <Route path="ajouter-produit" element={<AjouterProduit />} />
              <Route path="gestion-stock" element={<GestionStock />} />
              <Route path="produits/:id/variantes" element={<GestionVariantes />} />
              <Route path="gestion-livraison" element={<VendeurGestionLivraison />} />
              <Route path="commandes" element={<VendeurCommandes />} />
              <Route path="recuperer-commandes" element={<RecupererCommandes />} />
              <Route path="api-commandes" element={<RecupererCommandesAPI />} />
              <Route path="analytics" element={<AnalyticsVendeur />} />
              <Route path="parametres" element={<VendeurParametres />} />
              <Route path="profil" element={<ProfilVendeur />} />
            </Route>
          </Route>
          
          {/* Routes protégées Admin avec AdminLayout */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            } 
          >
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="utilisateurs" element={<AdminUtilisateurs />} />
            <Route path="validations" element={<AdminValidations />} />
            <Route path="boutiques" element={<AdminBoutiques />} />
            <Route path="produits" element={<AdminProduits />} />
            <Route path="commandes" element={<AdminCommandes />} />
            <Route path="parametres" element={<AdminParametres />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </PanierProvider>
    </ThemeProvider>
  );
}

export default App;