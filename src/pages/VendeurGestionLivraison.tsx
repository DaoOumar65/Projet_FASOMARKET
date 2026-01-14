import { useState, useEffect } from 'react';
import { Truck, Edit2, Save, X } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

interface ParametresLivraison {
  livraisonActive: boolean;
  fraisLivraison: number;
  zonesLivraison: string[];
  delaiLivraison: string;
}

export default function VendeurGestionLivraison() {
  const [loading, setLoading] = useState(true);
  const [livraison, setLivraison] = useState<ParametresLivraison>({
    livraisonActive: false,
    fraisLivraison: 0,
    zonesLivraison: [],
    delaiLivraison: '24-48h'
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await vendorService.getBoutique();
      if (res.data) {
        setLivraison({
          livraisonActive: res.data.livraison || false,
          fraisLivraison: res.data.fraisLivraison || 0,
          zonesLivraison: res.data.zonesLivraison || [],
          delaiLivraison: res.data.delaiLivraison || '24-48h'
        });
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await vendorService.updateLivraison(livraison);
      setEditing(false);
      toast.success('Paramètres de livraison mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
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
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Gestion Livraison</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>Configurez vos paramètres de livraison</p>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={24} color="#2563eb" />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Paramètres de livraison</h2>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Edit2 size={16} />
              Modifier
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
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
                <Save size={16} />
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={livraison.livraisonActive}
                onChange={(e) => setLivraison({ ...livraison, livraisonActive: e.target.checked })}
                disabled={!editing}
                style={{ width: '18px', height: '18px' }}
              />
              Livraison activée
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Frais de livraison (FCFA)
            </label>
            <input
              type="number"
              value={livraison.fraisLivraison}
              onChange={(e) => setLivraison({ ...livraison, fraisLivraison: Number(e.target.value) })}
              disabled={!editing}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Délai de livraison
            </label>
            <select
              value={livraison.delaiLivraison}
              onChange={(e) => setLivraison({ ...livraison, delaiLivraison: e.target.value })}
              disabled={!editing}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="24h">24 heures</option>
              <option value="24-48h">24-48 heures</option>
              <option value="48-72h">48-72 heures</option>
              <option value="3-5j">3-5 jours</option>
            </select>
          </div>
        </div>
      </div>

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
