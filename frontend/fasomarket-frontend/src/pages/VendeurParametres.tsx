import { useState, useEffect } from 'react';
import { Settings, User, Lock, Bell, Save, Eye, EyeOff } from 'lucide-react';
import { vendorService, authService } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

interface ProfilData {
  nomComplet: string;
  telephone: string;
  email: string;
}

interface MotDePasseData {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
  confirmerMotDePasse: string;
}

interface NotificationSettings {
  nouvellesCommandes: boolean;
  miseAJourStock: boolean;
  rapportsVentes: boolean;
  promotions: boolean;
}

export default function VendeurParametres() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    ancien: false,
    nouveau: false,
    confirmer: false
  });

  // États pour les formulaires
  const [profilData, setProfilData] = useState<ProfilData>({
    nomComplet: user?.nomComplet || '',
    telephone: user?.telephone || '',
    email: user?.email || ''
  });

  const [motDePasseData, setMotDePasseData] = useState<MotDePasseData>({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: ''
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    nouvellesCommandes: true,
    miseAJourStock: true,
    rapportsVentes: false,
    promotions: true
  });

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vendorService.updateProfil(profilData);
      updateUser({ ...user!, ...profilData });
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (motDePasseData.nouveauMotDePasse !== motDePasseData.confirmerMotDePasse) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (motDePasseData.nouveauMotDePasse.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(motDePasseData.ancienMotDePasse, motDePasseData.nouveauMotDePasse);
      toast.success('Mot de passe modifié');
      setMotDePasseData({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmerMotDePasse: ''
      });
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      await vendorService.updateNotificationSettings(notificationSettings);
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'securite', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Paramètres</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
        {/* Menu latéral */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <div style={{ padding: '16px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                    color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px' }}>
          {activeTab === 'profil' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Informations du profil</h2>
              <form onSubmit={handleUpdateProfil}>
                <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profilData.nomComplet}
                      onChange={(e) => setProfilData({ ...profilData, nomComplet: e.target.value })}
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
                      value={profilData.telephone}
                      onChange={(e) => setProfilData({ ...profilData, telephone: e.target.value })}
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
                      value={profilData.email}
                      onChange={(e) => setProfilData({ ...profilData, email: e.target.value })}
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

                <button
                  type="submit"
                  disabled={loading}
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
                  <Save size={16} />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'securite' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Changer le mot de passe</h2>
              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Mot de passe actuel
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.ancien ? 'text' : 'password'}
                        value={motDePasseData.ancienMotDePasse}
                        onChange={(e) => setMotDePasseData({ ...motDePasseData, ancienMotDePasse: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, ancien: !showPasswords.ancien })}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                      >
                        {showPasswords.ancien ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Nouveau mot de passe
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.nouveau ? 'text' : 'password'}
                        value={motDePasseData.nouveauMotDePasse}
                        onChange={(e) => setMotDePasseData({ ...motDePasseData, nouveauMotDePasse: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, nouveau: !showPasswords.nouveau })}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                      >
                        {showPasswords.nouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Confirmer le nouveau mot de passe
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.confirmer ? 'text' : 'password'}
                        value={motDePasseData.confirmerMotDePasse}
                        onChange={(e) => setMotDePasseData({ ...motDePasseData, confirmerMotDePasse: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirmer: !showPasswords.confirmer })}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                      >
                        {showPasswords.confirmer ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
                  <Lock size={16} />
                  {loading ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Préférences de notification</h2>
              <div style={{ display: 'grid', gap: '24px', marginBottom: '32px' }}>
                {Object.entries(notificationSettings).map(([key, value]) => {
                  const labels = {
                    nouvellesCommandes: 'Nouvelles commandes',
                    miseAJourStock: 'Alertes de stock faible',
                    rapportsVentes: 'Rapports de ventes hebdomadaires',
                    promotions: 'Promotions et offres spéciales'
                  };
                  
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                          {labels[key as keyof typeof labels]}
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          Recevoir des notifications pour {labels[key as keyof typeof labels].toLowerCase()}
                        </p>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: value ? '#2563eb' : '#d1d5db',
                          borderRadius: '24px',
                          transition: 'background-color 0.2s'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: value ? '27px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s'
                          }}></span>
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleUpdateNotifications}
                disabled={loading}
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
                <Bell size={16} />
                {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}