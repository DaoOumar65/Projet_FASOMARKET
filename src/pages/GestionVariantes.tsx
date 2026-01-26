import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

interface ProduitVariante {
  id: string;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
}

export default function GestionVariantes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVariante, setEditingVariante] = useState<ProduitVariante | null>(null);
  const [formData, setFormData] = useState({
    couleur: '',
    taille: '',
    modele: '',
    prixAjustement: 0,
    stock: 0
  });

  useEffect(() => {
    if (id) {
      fetchVariantes();
    }
  }, [id]);

  const fetchVariantes = async () => {
    try {
      const response = await vendorService.getProduitVariantes(id!);
      setVariantes(response.data || []);
    } catch (error) {
      console.error('Erreur chargement variantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVariante) {
        await vendorService.updateVariante(id!, editingVariante.id, formData);
        toast.success('Variante modifiée');
      } else {
        await vendorService.creerVariante(id!, formData);
        toast.success('Variante créée');
      }
      setShowModal(false);
      setEditingVariante(null);
      setFormData({ couleur: '', taille: '', modele: '', prixAjustement: 0, stock: 0 });
      fetchVariantes();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleGenerate = async () => {
    try {
      await vendorService.genererVariantes(id!);
      toast.success('Variantes générées automatiquement');
      fetchVariantes();
    } catch (error) {
      toast.error('Erreur lors de la génération');
    }
  };

  const handleDelete = async (varianteId: string) => {
    if (confirm('Supprimer cette variante ?')) {
      try {
        await vendorService.supprimerVariante(id!, varianteId);
        toast.success('Variante supprimée');
        fetchVariantes();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openModal = (variante?: ProduitVariante) => {
    if (variante) {
      setEditingVariante(variante);
      setFormData({
        couleur: variante.couleur || '',
        taille: variante.taille || '',
        modele: variante.modele || '',
        prixAjustement: variante.prixAjustement,
        stock: variante.stock
      });
    } else {
      setEditingVariante(null);
      setFormData({ couleur: '', taille: '', modele: '', prixAjustement: 0, stock: 0 });
    }
    setShowModal(true);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
          Gestion des variantes
        </h1>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Ajouter variante
        </button>
        <button
          onClick={handleGenerate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Générer auto
        </button>
      </div>

      {variantes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Aucune variante créée pour ce produit
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => openModal()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Créer manuellement
            </button>
            <button
              onClick={handleGenerate}
              style={{
                padding: '12px 24px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Générer automatiquement
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {variantes.map((variante) => (
            <div
              key={variante.id}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  {variante.couleur && (
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      {variante.couleur}
                    </span>
                  )}
                  {variante.taille && (
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      {variante.taille}
                    </span>
                  )}
                  {variante.modele && (
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      {variante.modele}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
                  <span>Prix: {variante.prixAjustement.toLocaleString()} FCFA</span>
                  <span>Stock: {variante.stock}</span>
                  <span>SKU: {variante.sku}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openModal(variante)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={16} color="#6b7280" />
                </button>
                <button
                  onClick={() => handleDelete(variante.id)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#fef2f2',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingVariante ? 'Modifier la variante' : 'Nouvelle variante'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Couleur
                </label>
                <input
                  type="text"
                  value={formData.couleur}
                  onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Taille
                </label>
                <input
                  type="text"
                  value={formData.taille}
                  onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Modèle
                </label>
                <input
                  type="text"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.prixAjustement}
                  onChange={(e) => setFormData({ ...formData, prixAjustement: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {editingVariante ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}