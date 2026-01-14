import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

const decodeHTML = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  status: 'ACTIVE' | 'HIDDEN';
  categorie: {
    nom: string;
  };
  dateCreation: string;
  nombreVentes: number;
}

export default function VendeurProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await vendorService.getProduits();
      setProduits(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduitStatus = async (produitId: string, currentStatus: string) => {
    setActionLoading(produitId);
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
      await vendorService.updateProduit(produitId, { status: newStatus });
      toast.success(`Produit ${newStatus === 'ACTIVE' ? 'activé' : 'masqué'}`);
      fetchProduits();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(null);
    }
  };

  const supprimerProduit = async (produitId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    setActionLoading(produitId);
    try {
      await vendorService.supprimerProduit(produitId);
      toast.success('Produit supprimé');
      fetchProduits();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProduits = produits.filter(produit =>
    produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.categorie.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutBadge = (status: string) => {
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: status === 'ACTIVE' ? '#dbeafe' : '#fee2e2',
        color: status === 'ACTIVE' ? '#2563eb' : '#dc2626'
      }}>
        {status === 'ACTIVE' ? 'Actif' : 'Masqué'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Mes produits</h1>
          <p style={{ color: '#6b7280' }}>{filteredProduits.length} produits trouvés</p>
        </div>
        <Link
          to="/vendeur/ajouter-produit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Ajouter produit
        </Link>
      </div>

      {/* Recherche */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Liste des produits */}
      {filteredProduits.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Package size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Aucun produit</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Commencez par ajouter votre premier produit</p>
          <Link
            to="/vendeur/ajouter-produit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Ajouter mon premier produit
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredProduits.map((produit) => (
            <div key={produit.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginRight: '12px' }}>{decodeHTML(produit.nom)}</h3>
                    {getStatutBadge(produit.status)}
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>{decodeHTML(produit.description)}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Prix</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>{produit.prix.toLocaleString()} FCFA</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Stock</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: produit.stock > 0 ? '#111827' : '#dc2626' }}>
                        {produit.stock} {produit.stock <= 1 ? 'unité' : 'unités'}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Catégorie</span>
                      <span style={{ fontSize: '14px', color: '#111827' }}>{produit.categorie.nom}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Ventes</span>
                      <span style={{ fontSize: '14px', color: '#111827' }}>{produit.nombreVentes}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Créé le</span>
                      <span style={{ fontSize: '14px', color: '#111827' }}>{new Date(produit.dateCreation).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                  <Link
                    to={`/vendeur/produits/${produit.id}/modifier`}
                    style={{
                      padding: '8px',
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit2 size={16} />
                  </Link>
                  
                  <button
                    onClick={() => toggleProduitStatus(produit.id, produit.status)}
                    disabled={actionLoading === produit.id}
                    style={{
                      padding: '8px',
                      backgroundColor: produit.status === 'ACTIVE' ? '#fee2e2' : '#dbeafe',
                      color: produit.status === 'ACTIVE' ? '#dc2626' : '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title={produit.status === 'ACTIVE' ? 'Masquer' : 'Activer'}
                  >
                    {produit.status === 'ACTIVE' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  
                  <button
                    onClick={() => supprimerProduit(produit.id)}
                    disabled={actionLoading === produit.id}
                    style={{
                      padding: '8px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}