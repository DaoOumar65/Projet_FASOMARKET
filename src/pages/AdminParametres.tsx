import { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Bell, Save } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

interface Categorie {
  id: string;
  nom: string;
  description: string;
  icone: string;
  nombreProduits?: number;
}

export default function AdminParametres() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categorie | null>(null);
  const [formData, setFormData] = useState({ nom: '', description: '', icone: '' });
  const [notificationData, setNotificationData] = useState({ titre: '', message: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.description || !formData.icone) {
      toast.error('Tous les champs sont requis');
      return;
    }

    setActionLoading('form');
    try {
      if (editingCategory) {
        await adminService.updateCategorie(editingCategory.id, formData);
        toast.success('Catégorie modifiée');
      } else {
        await adminService.creerCategorie(formData);
        toast.success('Catégorie créée');
      }
      
      setFormData({ nom: '', description: '', icone: '' });
      setShowAddForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditCategory = (category: Categorie) => {
    setEditingCategory(category);
    setFormData({
      nom: category.nom,
      description: category.description,
      icone: category.icone
    });
    setShowAddForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    setActionLoading(categoryId);
    try {
      await adminService.supprimerCategorie(categoryId);
      toast.success('Catégorie supprimée');
      fetchCategories();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationData.titre || !notificationData.message) {
      toast.error('Titre et message requis');
      return;
    }

    setActionLoading('notification');
    try {
      await adminService.diffuserNotification(notificationData.titre, notificationData.message);
      toast.success('Notification diffusée');
      setNotificationData({ titre: '', message: '' });
    } catch (error) {
      toast.error('Erreur lors de la diffusion');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ nom: '', description: '', icone: '' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Paramètres système</h1>

      {/* Gestion des catégories */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>Gestion des catégories</h2>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Ajouter catégorie
          </button>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showAddForm && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            <form onSubmit={handleSubmitCategory}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Électronique"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Icône (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icone}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                    placeholder="📱"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={actionLoading === 'form'}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={16} />
                  {editingCategory ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des catégories */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {categories.map((category) => (
            <div key={category.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px' }}>{category.icone}</div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{category.nom}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{category.description}</p>
                    {category.nombreProduits !== undefined && (
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>{category.nombreProduits} produits</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditCategory(category)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={actionLoading === category.id}
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
      </div>

      {/* Notifications système */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Notifications système</h2>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSendNotification}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Titre de la notification
              </label>
              <input
                type="text"
                value={notificationData.titre}
                onChange={(e) => setNotificationData({ ...notificationData, titre: e.target.value })}
                placeholder="Titre de la notification..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Message
              </label>
              <textarea
                value={notificationData.message}
                onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                placeholder="Message de la notification..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading === 'notification'}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Bell size={16} />
              Diffuser la notification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
