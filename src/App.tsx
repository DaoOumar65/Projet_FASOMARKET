import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PanierProvider } from './contexts/PanierContext';
import { useAuthInit } from './hooks/useAuthInit';
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
import Panier from './pages/Panier';
import Profil from './pages/Profil';
import Categories from './pages/Categories';
import Boutiques from './pages/Boutiques';
import DetailBoutique from './pages/DetailBoutique';
import Produits from './pages/Produits';
import TestAdresse from './pages/TestAdresse';

function App() {
  useAuthInit();
  
  return (
    <PanierProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
                <PasserCommande />
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
            path="/commande/:id" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <DetailCommande />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favoris" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <ClientFavoris />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/adresses" 
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <Header />
                <ClientAdresses />
              </ProtectedRoute>
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
          
          {/* Routes protégées Vendeur avec VendorLayout */}
          <Route path="/vendeur/*" element={<VendeurGuard />}>
            {/* Pages de statut */}
            <Route path="attente-validation" element={<PageAttenteValidationCompte />} />
            <Route path="creer-boutique-status" element={<DashboardCreationBoutique />} />
            <Route path="creer-boutique" element={<CreerBoutique />} />
            
            {/* Dashboard avec layout */}
            <Route path="*" element={<VendorLayout />}>
              <Route path="dashboard" element={<DashboardVendeur />} />
              <Route path="boutique" element={<VendeurBoutique />} />
              <Route path="produits" element={<VendeurProduits />} />
              <Route path="produits/:id/modifier" element={<ModifierProduit />} />
              <Route path="ajouter-produit" element={<AjouterProduit />} />
              <Route path="gestion-stock" element={<VendeurGestionStock />} />
              <Route path="gestion-livraison" element={<VendeurGestionLivraison />} />
              <Route path="commandes" element={<VendeurCommandes />} />
              <Route path="recuperer-commandes" element={<RecupererCommandes />} />
              <Route path="api-commandes" element={<RecupererCommandesAPI />} />
              <Route path="analytics" element={<VendeurAnalytics />} />
              <Route path="parametres" element={<VendeurParametres />} />
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
  );
}

export default App;