import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, ArrowLeft } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

export default function CreerBoutique() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
    horairesOuverture: '',
    categorie: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.nom.trim()) {
      toast.error('Le nom de la boutique est obligatoire');
      return;
    }
    if (!formData.telephone.trim()) {
      toast.error('Le téléphone est obligatoire');
      return;
    }
    if (!formData.adresse.trim()) {
      toast.error('L\'adresse est obligatoire');
      return;
    }
    
    setLoading(true);

    try {
      const result = await vendorService.creerBoutique(formData);
      toast.success('Boutique créée avec succès ! En attente de validation.');
      navigate('/vendeur/dashboard');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/connexion');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || error.response?.data || 'Données invalides';
        toast.error(`Validation échouée: ${message}`);
      } else {
        toast.error('Erreur lors de la création de la boutique');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ padding: '12px', backgroundColor: '#2563eb', borderRadius: '12px' }}>
              <Store size={24} style={{ color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
              Créer ma boutique
            </h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Remplissez les informations de votre boutique pour commencer à vendre
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Nom de la boutique */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Nom de la boutique *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Boutique Mode Africaine"
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

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Décrivez votre boutique, vos produits et ce qui vous rend unique..."
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

              {/* Adresse */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Adresse *
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Secteur 15, Ouagadougou"
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

              {/* Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    placeholder="+226 XX XX XX XX"
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@maboutique.com"
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

              {/* Horaires */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Horaires d'ouverture
                </label>
                <input
                  type="text"
                  name="horairesOuverture"
                  value={formData.horairesOuverture}
                  onChange={handleChange}
                  placeholder="Ex: Lun-Ven 8h-18h, Sam 8h-15h"
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

              {/* Catégories */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Catégorie principale
                </label>
                <input
                  type="text"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  placeholder="Ex: Mode, Alimentation, Électronique"
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

            {/* Actions */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Store size={16} />
                    Créer ma boutique
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Info */}
        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
            ℹ️ Votre boutique sera soumise à validation par notre équipe. Vous recevrez une notification une fois approuvée.
          </p>
        </div>
      </div>
    </div>
  );
}