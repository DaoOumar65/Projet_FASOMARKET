import { useState, useEffect } from 'react';
import { Store, Edit2, Save, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { vendorService } from '../services/api';
import AdresseMapSimple from '../components/AdresseMapSimple';
import BoutiqueAvatar from '../components/BoutiqueAvatar';
import toast from 'react-hot-toast';

interface Boutique {
  id: string;
  nom: string;
  description: string;
  adresse: string;
  telephone: string;
  email: string;
  statut: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  dateCreation: string;
  nombreProduits: number;
  ventesTotales: number;
}

export default function VendeurBoutique() {
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
    image: null as File | null
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchBoutique();
  }, []);

  const fetchBoutique = async () => {
    try {
      const response = await vendorService.getBoutique();
      const data = response.data;
      
      // Nouveau format: {boutique: null, message: "..."} ou directement la boutique
      if (data.boutique === null) {
        setBoutique(null);
        toast.info(data.message || 'Aucune boutique créée');
      } else {
        const boutique = data.boutique || data;
        setBoutique(boutique);
        setFormData({
          nom: boutique.nom,
          description: boutique.description,
          adresse: boutique.adresse,
          telephone: boutique.telephone,
          email: boutique.email,
          image: null
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement de la boutique:', error);
      setBoutique(null);
      // Erreur 400 = pas de boutique (backend pas encore fixé)
      if (error.response?.status === 400) {
        toast.info('Aucune boutique créée. Créez votre première boutique pour commencer.');
      } else {
        toast.error('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!boutique) return;
    
    setSaveLoading(true);
    try {
      // Mettre à jour les infos de base
      await vendorService.updateBoutique(boutique.id, {
        nom: formData.nom,
        description: formData.description,
        adresse: formData.adresse,
        telephone: formData.telephone,
        email: formData.email
      });
      
      // Upload de l'image si sélectionnée
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('logo', formData.image);
        
        await fetch(`http://localhost:8081/api/boutiques/${boutique.id}/logo`, {
          method: 'POST',
          headers: {
            'X-User-Id': localStorage.getItem('userId') || ''
          },
          body: imageFormData
        });
      }
      
      toast.success('Boutique mise à jour');
      setEditing(false);
      fetchBoutique();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    const colors = {
      ACTIVE: { bg: '#dcfce7', text: '#16a34a' },
      PENDING: { bg: '#fef3c7', text: '#d97706' },
      SUSPENDED: { bg: '#fee2e2', text: '#dc2626' }
    };
    const color = colors[statut as keyof typeof colors] || colors.PENDING;
    
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: color.bg,
        color: color.text
      }}>
        {statut === 'ACTIVE' ? 'Active' : statut === 'PENDING' ? 'En attente' : 'Suspendue'}
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

  if (!boutique) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Store size={64} style={{ color: '#6b7280', margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Aucune boutique trouvée</h2>
        <p style={{ color: '#6b7280' }}>Vous devez d'abord créer votre boutique.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Ma boutique</h1>
          <p style={{ color: '#6b7280' }}>Gérez les informations de votre boutique</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
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
            <Edit2 size={16} />
            Modifier
          </button>
        )}
      </div>

      {/* Informations de la boutique */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <BoutiqueAvatar image={boutique.logoUrl} nom={boutique.nom} size={64} />
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{boutique.nom}</h2>
                {getStatutBadge(boutique.statut)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {editing ? (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
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
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
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

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Image de la boutique
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {formData.image && (
                  <div style={{ marginTop: '8px' }}>
                    <img 
                      src={URL.createObjectURL(formData.image)} 
                      alt="Aperçu"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                
                {/* Aperçu de l'adresse */}
                {formData.adresse && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      Aperçu de l'adresse :
                    </p>
                    <AdresseMapSimple 
                      adresse={formData.adresse}
                      nom={formData.nom || 'Ma boutique'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
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
                  {saveLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={() => setEditing(false)}
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
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Informations de contact</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{boutique.telephone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{boutique.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{boutique.adresse}</span>
                    </div>
                    
                    {/* Composant de localisation */}
                    <div style={{ marginTop: '8px' }}>
                      <AdresseMapSimple 
                        adresse={boutique.adresse}
                        nom={boutique.nom}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Statistiques</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Produits:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{boutique.nombreProduits}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Ventes totales:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{(boutique.ventesTotales || 0).toLocaleString()} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Créée le {new Date(boutique.dateCreation).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Description</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>{boutique.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
