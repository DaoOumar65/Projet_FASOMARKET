import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Truck } from 'lucide-react';
import { usePanier } from '../hooks/usePanier';
import { clientService } from '../services/api';
import toast from 'react-hot-toast';

export default function Commander() {
  const navigate = useNavigate();
  const { panierItems, total, viderPanier } = usePanier();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    adresseLivraison: '',
    methodePaiement: 'MOBILE_MONEY',
    numeroTelephone: '',
    instructions: ''
  });

  const fraisLivraison = panierItems.reduce((sum, item) => 
    sum + (item.produit?.boutique?.fraisLivraison || 0), 0);
  const totalFinal = total + fraisLivraison;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await clientService.creerCommande({
        adresseLivraison: formData.adresseLivraison,
        methodePaiement: formData.methodePaiement,
        numeroTelephone: formData.numeroTelephone,
        instructions: formData.instructions
      });

      await viderPanier();
      toast.success('Commande créée avec succès !');
      navigate(`/client/commandes/${response.data.id}`);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (panierItems.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Panier vide</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Ajoutez des produits avant de commander</p>
          <button onClick={() => navigate('/produits')} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Voir les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <button onClick={() => navigate('/panier')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
        <ArrowLeft size={20} />
        Retour au panier
      </button>

      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Finaliser la commande</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>📍 Adresse de livraison</h2>
            <textarea
              value={formData.adresseLivraison}
              onChange={(e) => setFormData({ ...formData, adresseLivraison: e.target.value })}
              required
              rows={3}
              placeholder="Ex: Secteur 15, Avenue Kwame Nkrumah, Ouagadougou"
              style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>💳 Mode de paiement</h2>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: formData.methodePaiement === 'MOBILE_MONEY' ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: formData.methodePaiement === 'MOBILE_MONEY' ? '#eff6ff' : 'white' }}>
                <input type="radio" name="methodePaiement" value="MOBILE_MONEY" checked={formData.methodePaiement === 'MOBILE_MONEY'} onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value })} />
                <Smartphone size={24} color="#2563eb" />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>Mobile Money</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Orange Money, Moov Money</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: formData.methodePaiement === 'PAIEMENT_LIVRAISON' ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: formData.methodePaiement === 'PAIEMENT_LIVRAISON' ? '#eff6ff' : 'white' }}>
                <input type="radio" name="methodePaiement" value="PAIEMENT_LIVRAISON" checked={formData.methodePaiement === 'PAIEMENT_LIVRAISON'} onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value })} />
                <Truck size={24} color="#10b981" />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>Paiement à la livraison</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Payez en espèces</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: formData.methodePaiement === 'CARTE_BANCAIRE' ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: formData.methodePaiement === 'CARTE_BANCAIRE' ? '#eff6ff' : 'white' }}>
                <input type="radio" name="methodePaiement" value="CARTE_BANCAIRE" checked={formData.methodePaiement === 'CARTE_BANCAIRE'} onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value })} />
                <CreditCard size={24} color="#f59e0b" />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>Carte bancaire</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Visa, Mastercard</div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Numéro de téléphone *</label>
              <input
                type="tel"
                value={formData.numeroTelephone}
                onChange={(e) => setFormData({ ...formData, numeroTelephone: e.target.value })}
                required
                placeholder="+226 70 12 34 56"
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>📝 Instructions (optionnel)</h2>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={3}
              placeholder="Instructions spéciales pour la livraison..."
              style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Création en cours...' : 'Confirmer la commande'}
          </button>
        </form>

        <div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', position: 'sticky', top: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>📦 Récapitulatif</h2>
            
            <div style={{ marginBottom: '20px' }}>
              {panierItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <img src={item.produit?.images?.[0] || ''} alt={item.produit?.nom} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.produit?.nom}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Qté: {item.quantite}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>{((item.produit?.prix || 0) * item.quantite).toLocaleString()} FCFA</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280' }}>Sous-total</span>
              <span style={{ fontWeight: '600' }}>{total.toLocaleString()} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#6b7280' }}>Frais de livraison</span>
              <span style={{ fontWeight: '600' }}>{fraisLivraison.toLocaleString()} FCFA</span>
            </div>
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>{totalFinal.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
