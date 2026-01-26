import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

export default function ModifierProduit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tailleInput, setTailleInput] = useState('');
  const [couleurInput, setCouleurInput] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    status: 'ACTIVE',
    // Détails produit
    tailles: [] as string[],
    couleurs: [] as string[],
    marque: '',
    matiere: '',
    poids: '',
    dimensions: '',
    garantie: '',
    origine: ''
  });

  useEffect(() => {
    fetchProduit();
  }, [id]);

  const fetchProduit = async () => {
    try {
      const response = await vendorService.getProduit(id!);
      const produit = response.data;
      console.log('Produit reçu:', produit);
      
      // Parser sizes/colors si ce sont des JSON strings
      let tailles = [];
      let couleurs = [];
      
      if (produit.sizes) {
        try {
          tailles = typeof produit.sizes === 'string' ? JSON.parse(produit.sizes) : produit.sizes;
        } catch (e) {
          console.error('Erreur parse sizes:', e);
        }
      }
      
      if (produit.colors) {
        try {
          couleurs = typeof produit.colors === 'string' ? JSON.parse(produit.colors) : produit.colors;
        } catch (e) {
          console.error('Erreur parse colors:', e);
        }
      }
      
      setFormData({
        nom: produit.nom || '',
        description: produit.description || '',
        prix: produit.prix ? produit.prix.toString() : '0',
        stock: produit.stock !== undefined ? produit.stock.toString() : '0',
        status: produit.status || 'ACTIVE',
        // Détails produit - mapper depuis le backend
        tailles: tailles,
        couleurs: couleurs,
        marque: produit.marque || produit.details?.marque || '',
        matiere: produit.materiau || produit.details?.matiere || '',
        poids: produit.poids || produit.details?.poids || '',
        dimensions: produit.dimensions || produit.details?.dimensions || '',
        garantie: produit.periodeGarantie || produit.details?.garantie || '',
        origine: produit.origine || produit.details?.origine || ''
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
      // Vérifications de sécurité
      if (!formData.nom || !formData.description || !formData.prix || !formData.stock) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        setSaving(false);
        return;
      }

      const prixNum = parseFloat(formData.prix);
      const stockNum = parseInt(formData.stock);
      
      if (isNaN(prixNum) || prixNum <= 0) {
        toast.error('Le prix doit être un nombre valide');
        setSaving(false);
        return;
      }
      
      if (isNaN(stockNum) || stockNum < 0) {
        toast.error('Le stock doit être un nombre valide');
        setSaving(false);
        return;
      }

      const payload = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        prix: prixNum,
        quantiteStock: stockNum,
        status: formData.status || 'ACTIVE',
        // Détails produit - Toujours envoyer (éviter NULL)
        sizes: formData.tailles && Array.isArray(formData.tailles) && formData.tailles.length > 0 ? JSON.stringify(formData.tailles) : '[]',
        colors: formData.couleurs && Array.isArray(formData.couleurs) && formData.couleurs.length > 0 ? JSON.stringify(formData.couleurs) : '[]',
        marque: (formData.marque && typeof formData.marque === 'string' ? formData.marque.trim() : '') || '',
        materiau: (formData.matiere && typeof formData.matiere === 'string' ? formData.matiere.trim() : '') || '',
        poids: (formData.poids && typeof formData.poids === 'string' ? formData.poids.trim() : '') || '',
        dimensions: (formData.dimensions && typeof formData.dimensions === 'string' ? formData.dimensions.trim() : '') || '',
        periodeGarantie: (formData.garantie && typeof formData.garantie === 'string' ? formData.garantie.trim() : '') || '',
        origine: (formData.origine && typeof formData.origine === 'string' ? formData.origine.trim() : '') || ''
      };

      console.log('Payload modification:', payload);
      await vendorService.updateProduit(id!, payload);
      toast.success('Produit modifié avec succès !');
      navigate('/vendeur/produits');
    } catch (error: any) {
      console.error('Erreur:', error.response?.data);
      if (error.response?.data?.errors) {
        const erreurs = error.response.data.errors;
        const messages = Object.keys(erreurs).map(key => `${key}: ${erreurs[key]}`).join(', ');
        toast.error(`Validation: ${messages}`);
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la modification');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTaille = () => {
    if (tailleInput.trim() && !formData.tailles.includes(tailleInput.trim())) {
      setFormData({ ...formData, tailles: [...formData.tailles, tailleInput.trim()] });
      setTailleInput('');
    }
  };

  const removeTaille = (taille: string) => {
    setFormData({ ...formData, tailles: formData.tailles.filter(t => t !== taille) });
  };

  const addCouleur = () => {
    if (couleurInput.trim() && !formData.couleurs.includes(couleurInput.trim())) {
      setFormData({ ...formData, couleurs: [...formData.couleurs, couleurInput.trim()] });
      setCouleurInput('');
    }
  };

  const removeCouleur = (couleur: string) => {
    setFormData({ ...formData, couleurs: formData.couleurs.filter(c => c !== couleur) });
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

        {/* Détails du produit */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Détails du produit</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tailles disponibles</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input type="text" value={tailleInput} onChange={(e) => setTailleInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTaille())}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: S, M, L, XL" />
                <button type="button" onClick={addTaille} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {formData.tailles.map((taille: string) => (
                  <span key={taille} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {taille}
                    <button type="button" onClick={() => removeTaille(taille)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Couleurs disponibles</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input type="text" value={couleurInput} onChange={(e) => setCouleurInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCouleur())}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: Rouge, Bleu, Vert" />
                <button type="button" onClick={addCouleur} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {formData.couleurs.map((couleur: string) => (
                  <span key={couleur} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {couleur}
                    <button type="button" onClick={() => removeCouleur(couleur)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Marque</label>
              <input type="text" name="marque" value={formData.marque} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: Nike" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Matière</label>
              <input type="text" name="matiere" value={formData.matiere} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 100% Coton" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Poids</label>
              <input type="text" name="poids" value={formData.poids} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 200g" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Dimensions</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 30x20x10 cm" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Garantie</label>
              <input type="text" name="garantie" value={formData.garantie} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 6 mois" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Origine</label>
              <input type="text" name="origine" value={formData.origine} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: Burkina Faso" />
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
