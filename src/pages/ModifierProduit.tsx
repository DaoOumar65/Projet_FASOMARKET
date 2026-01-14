import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

export default function ModifierProduit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchProduit();
  }, [id]);

  const fetchProduit = async () => {
    try {
      const response = await vendorService.getProduit(id!);
      const produit = response.data;
      console.log('Produit reçu:', produit);
      
      setFormData({
        nom: produit.nom || '',
        description: produit.description || '',
        prix: produit.prix ? produit.prix.toString() : '0',
        stock: produit.stock !== undefined ? produit.stock.toString() : '0',
        status: produit.status || 'ACTIVE'
      });
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      if (error.response?.status === 405) {
        toast.error('Endpoint non implémenté (405). Voir FIX_URGENT_PRODUITS.md');
      } else if (error.response?.status === 404) {
        toast.error('Produit non trouvé');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erreur réseau. Vérifiez que le backend est démarré.');
      } else {
        toast.error('Erreur lors du chargement du produit');
      }
      navigate('/vendeur/produits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await vendorService.updateProduit(id!, {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        status: formData.status
      });
      toast.success('Produit modifié avec succès !');
      navigate('/vendeur/produits');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/vendeur/produits')} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', marginRight: '16px', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Modifier le produit</h1>
          <p style={{ color: '#6b7280' }}>Mettez à jour les informations du produit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Informations du produit</h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Nom du produit *</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Prix (FCFA) *</label>
                <input type="number" name="prix" value={formData.prix} onChange={handleChange} required min="0" step="0.01"
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Stock *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0"
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Statut *</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
                  <option value="ACTIVE">Actif</option>
                  <option value="HIDDEN">Masqué</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/vendeur/produits')} style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Annuler</button>
          <button type="submit" disabled={saving} style={{ padding: '12px 24px', backgroundColor: saving ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
