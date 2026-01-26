import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, CreditCard, Phone, Clock, ArrowLeft, XCircle } from 'lucide-react';
import { STATUS_LABELS } from '../constants/orderStatus';
import toast from 'react-hot-toast';

interface CommandeDetails {
  id: string;
  numero: string;
  statut: string;
  total: number;
  adresseLivraison: string;
  methodePaiement: string;
  numeroTelephone: string;
  dateCreation: string;
  peutAnnuler?: boolean;
  items: Array<{
    id: string;
    quantite: number;
    prixUnitaire: number;
    produit: {
      id: string;
      nom: string;
      images: string[];
    };
  }>;
}

const statutConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: STATUS_LABELS.PENDING, color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: STATUS_LABELS.CONFIRMED, color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: STATUS_LABELS.SHIPPED, color: 'bg-purple-100 text-purple-800', icon: Package },
  DELIVERED: { label: STATUS_LABELS.DELIVERED, color: 'bg-green-100 text-green-800', icon: Package },
  CANCELLED: { label: STATUS_LABELS.CANCELLED, color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function DetailCommande() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<CommandeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const annulerCommande = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    
    setCancelling(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/client/commandes/${id}/annuler`, {
        method: 'PUT',
        headers: { 'X-User-Id': userId || '' }
      });
      
      if (response.ok) {
        toast.success('Commande annulée avec succès');
        // Recharger les détails de la commande
        const updatedResponse = await fetch(`http://localhost:8081/api/client/commandes/${id}`, {
          headers: { 'X-User-Id': userId || '' }
        });
        if (updatedResponse.ok) {
          setCommande(await updatedResponse.json());
        }
      } else {
        toast.error('Erreur lors de l\'annulation');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchCommande = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:8081/api/client/commandes/${id}`, {
          headers: { 'X-User-Id': userId || '' }
        });
        if (response.ok) {
          setCommande(await response.json());
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommande();
  }, [id]);

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (!commande) return <div className="text-center py-8">Commande introuvable</div>;

  const config = statutConfig[commande?.statut] || statutConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{commande.numero || commande.numeroCommande || `CMD-${commande.id}`}</h1>
            <p className="text-gray-600">{commande.dateCreation ? new Date(commande.dateCreation).toLocaleString('fr-FR') : commande.dateCommande ? new Date(commande.dateCommande).toLocaleString('fr-FR') : 'Date inconnue'}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${config.color}`}>
            <Icon className="w-4 h-4 mr-2" />
            {config.label}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="font-semibold mb-1">Adresse de livraison</p>
              <p className="text-gray-600">{commande.adresseLivraison || 'Non spécifiée'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <CreditCard className="w-5 h-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="font-semibold mb-1">Mode de paiement</p>
              <p className="text-gray-600">{commande.methodePaiement?.replace('_', ' ') || 'Non spécifié'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Phone className="w-5 h-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="font-semibold mb-1">Téléphone</p>
              <p className="text-gray-600">{commande.numeroTelephone || 'Non spécifié'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Articles commandés</h2>
        <div className="space-y-4">
          {(commande.items || []).map((item) => (
            <div key={item.id} className="flex items-center border-b pb-4">
              <img
                src={item.produit?.images?.[0] || '/placeholder.png'}
                alt={item.produit?.nom || 'Produit'}
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.produit?.nom || 'Produit inconnu'}</h3>
                <p className="text-gray-600">Quantité: {item.quantite || 0}</p>
              </div>
              <p className="font-bold">{((item.prixUnitaire || 0) * (item.quantite || 0)).toLocaleString()} FCFA</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">
              <span>Total: {(commande.total || 0).toLocaleString()} FCFA</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {commande.peutAnnuler && (
                <button
                  onClick={annulerCommande}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {cancelling ? 'Annulation...' : 'Annuler la commande'}
                </button>
              )}
              <button
                onClick={() => navigate(`/paiement/${id}`)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={16} />
                Payer maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
