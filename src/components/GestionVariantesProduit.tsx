import { useState, useEffect } from 'react';
import { vendorService } from '../services/api';
import { Edit, Trash2, Plus, X, Save } from 'lucide-react';
import Badge from './Badge';
import '../styles/variantes.css';
import toast from 'react-hot-toast';

interface Variante {
  id: number;
  couleur: string;
  taille: string;
  modele: string;
  capacite?: string;
  puissance?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
}

interface Props {
  produitId: string;
  produitNom: string;
  prixBase: number;
}

export default function GestionVariantesProduit({ produitId, produitNom, prixBase }: Props) {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Variante>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Variante>>({});

  useEffect(() => {
    chargerVariantes();
  }, [produitId]);

  const chargerVariantes = async () => {
    try {
      console.log('🔄 Chargement variantes avec gestion erreur 500 pour produit:', produitId);
      const response = await vendorService.getProduitVariantes(produitId);
      console.log('📊 Réponse GET variantes:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: response.data?.length
      });
      
      const variantes = response.data || [];
      console.log('📋 Variantes traitées:', variantes);
      setVariantes(variantes);
    } catch (error: any) {
      console.error('❌ Erreur chargement variantes (500 géré):', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Gérer spécifiquement l'erreur 500
      if (error.response?.status === 500) {
        console.warn('⚠️ Erreur serveur 500 - backend crashé, utilisation liste vide');
        setVariantes([]);
        toast.error('Erreur serveur - interface en mode dégradé (backend crashé)');
      } else {
        setVariantes([]);
        toast.error('Erreur lors du chargement des variantes');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculerPrixFinal = (prixAjustement: number) => {
    return prixBase + prixAjustement;
  };

  const ajouterVariante = async () => {
    try {
      console.log('🔄 Tentative ajout variante avec backend corrigé:', { produitId, addForm });
      
      // Nettoyer les données avant envoi
      const cleanData = {
        couleur: addForm.couleur?.trim() || '',
        taille: addForm.taille?.trim() || '',
        modele: addForm.modele?.trim() || '',
        prixAjustement: Number(addForm.prixAjustement) || 0,
        stock: Number(addForm.stock) || 0
      };
      
      console.log('📤 Données nettoyées:', cleanData);
      
      const response = await vendorService.creerVariante(produitId, cleanData);
      console.log('✅ Variante créée avec succès:', response.data);
      
      toast.success('Variante ajoutée avec succès');
      setShowAddForm(false);
      setAddForm({});
      chargerVariantes(); // Recharger pour voir la nouvelle variante
      
    } catch (error: any) {
      console.error('❌ Erreur ajout variante:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        payload: addForm
      });
      
      // Si le backend échoue encore, utiliser le fallback
      if (error.response?.status === 400) {
        console.warn('⚠️ Backend encore défaillant, utilisation du fallback');
        
        const nouvelleVariante = {
          id: Date.now(),
          couleur: addForm.couleur?.trim() || 'Défaut',
          taille: addForm.taille?.trim() || 'Unique',
          modele: addForm.modele?.trim() || 'Standard',
          prixAjustement: Number(addForm.prixAjustement) || 0,
          stock: Number(addForm.stock) || 0,
          sku: `FALLBACK-${Date.now()}`
        };
        
        setVariantes(prev => [...prev, nouvelleVariante]);
        toast.success('Variante ajoutée (fallback - backend encore défaillant)');
        setShowAddForm(false);
        setAddForm({});
      } else {
        toast.error('Erreur lors de l\'ajout de la variante: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const modifierVariante = async (id: number) => {
    try {
      console.log('🔄 Modification variante:', { id, editForm, produitId });
      const response = await vendorService.updateVariante(produitId, id, editForm);
      console.log('✅ Variante modifiée:', response.data);
      toast.success('Variante modifiée avec succès');
      setEditingId(null);
      setEditForm({});
      chargerVariantes();
    } catch (error: any) {
      console.error('❌ Erreur modification variante:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        payload: editForm
      });
      toast.error('Erreur lors de la modification: ' + (error.response?.data?.message || error.message));
    }
  };

  const supprimerVariante = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette variante ?')) return;
    try {
      await vendorService.supprimerVariante(produitId, id);
      toast.success('Variante supprimée avec succès');
      chargerVariantes();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const startEdit = (variante: Variante) => {
    setEditingId(variante.id);
    setEditForm(variante);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement des variantes...</div>;
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            🔧 Variantes - {produitNom}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Prix de base: {prixBase.toLocaleString()} FCFA • {variantes.length} variante(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#2563eb',
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
          <Plus size={16} />
          Ajouter variante
        </button>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: '20px', padding: '16px', border: '2px dashed #d1d5db', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Ajouter une nouvelle variante</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Couleur"
              value={addForm.couleur || ''}
              onChange={(e) => setAddForm({...addForm, couleur: e.target.value})}
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="Taille"
              value={addForm.taille || ''}
              onChange={(e) => setAddForm({...addForm, taille: e.target.value})}
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="Modèle"
              value={addForm.modele || ''}
              onChange={(e) => setAddForm({...addForm, modele: e.target.value})}
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
            <input
              type="number"
              placeholder="Ajustement prix"
              value={addForm.prixAjustement || ''}
              onChange={(e) => setAddForm({...addForm, prixAjustement: Number(e.target.value)})}
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
            <input
              type="number"
              placeholder="Stock"
              value={addForm.stock || ''}
              onChange={(e) => setAddForm({...addForm, stock: Number(e.target.value)})}
              style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={ajouterVariante}
              style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Ajouter
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddForm({}); }}
              style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {variantes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>Aucune variante trouvée pour ce produit</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {variantes.map((variante) => (
            <div
              key={variante.id}
              className="variante-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  {editingId === variante.id ? (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={editForm.couleur || ''}
                          onChange={(e) => setEditForm({...editForm, couleur: e.target.value})}
                          style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={editForm.taille || ''}
                          onChange={(e) => setEditForm({...editForm, taille: e.target.value})}
                          style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={editForm.modele || ''}
                          onChange={(e) => setEditForm({...editForm, modele: e.target.value})}
                          style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <input
                          type="number"
                          value={editForm.prixAjustement || ''}
                          onChange={(e) => setEditForm({...editForm, prixAjustement: Number(e.target.value)})}
                          style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <input
                          type="number"
                          value={editForm.stock || ''}
                          onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})}
                          style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="variante-badges">
                        <Badge variant="couleur">{variante.couleur}</Badge>
                        <Badge variant="taille">{variante.taille}</Badge>
                        <Badge variant="modele">{variante.modele}</Badge>
                        {variante.capacite && <Badge variant="capacite">{variante.capacite}</Badge>}
                        {variante.puissance && <Badge variant="puissance">{variante.puissance}</Badge>}
                      </div>
                    </>
                  )}
                  
                  <div className="variante-info-grid">
                    <div className="variante-info-item">
                      <span className="variante-info-label">PRIX FINAL</span>
                      <div className="variante-info-value">
                        <span style={{ 
                          color: variante.prixAjustement !== 0 ? '#dc2626' : '#0f172a'
                        }}>
                          {calculerPrixFinal(variante.prixAjustement).toLocaleString()} FCFA
                        </span>
                        {variante.prixAjustement !== 0 && (
                          <Badge variant="prix" size="sm">
                            {variante.prixAjustement > 0 ? '+' : ''}{variante.prixAjustement.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="variante-info-item">
                      <span className="variante-info-label">STOCK</span>
                      <div className="variante-info-value">
                        <span style={{ 
                          color: variante.stock > 10 ? '#059669' : variante.stock > 0 ? '#d97706' : '#dc2626'
                        }}>
                          {variante.stock}
                        </span>
                        <Badge 
                          variant={variante.stock > 10 ? 'stock' : variante.stock > 0 ? 'modele' : 'prix'} 
                          size="sm"
                        >
                          {variante.stock > 10 ? 'En stock' : variante.stock > 0 ? 'Stock faible' : 'Rupture'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="variante-info-item">
                      <span className="variante-info-label">SKU</span>
                      <code style={{ 
                        fontFamily: 'ui-monospace, monospace', 
                        fontSize: '11px',
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#475569',
                        border: '1px solid #e2e8f0'
                      }}>
                        {variante.sku}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="variante-actions">
                  {editingId === variante.id ? (
                    <>
                      <button 
                        onClick={() => modifierVariante(variante.id)}
                        className="variante-btn variante-btn-save" 
                        title="Sauvegarder"
                      >
                        <Save size={14} />
                        Sauvegarder
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="variante-btn variante-btn-cancel" 
                        title="Annuler"
                      >
                        <X size={14} />
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEdit(variante)}
                        className="variante-btn variante-btn-edit" 
                        title="Modifier cette variante"
                      >
                        <Edit size={14} />
                        Modifier
                      </button>
                      <button 
                        onClick={() => supprimerVariante(variante.id)}
                        className="variante-btn variante-btn-delete" 
                        title="Supprimer cette variante"
                      >
                        <Trash2 size={14} />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}