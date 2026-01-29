import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';
import { clientService, authService } from '../services/api';
import { useAuthStore } from '../store';

const profilSchema = z.object({
  nomComplet: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  adresse: z.string().optional(),
});

const passwordSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Mot de passe actuel requis'),
  nouveauMotDePasse: z.string().min(8, 'Minimum 8 caractères'),
  confirmerMotDePasse: z.string(),
}).refine((data) => data.nouveauMotDePasse === data.confirmerMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmerMotDePasse"],
});

type ProfilForm = z.infer<typeof profilSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profil() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { user, updateUser } = useAuthStore();

  const {
    register: registerProfil,
    handleSubmit: handleSubmitProfil,
    formState: { errors: profilErrors },
    setValue,
  } = useForm<ProfilForm>({
    resolver: zodResolver(profilSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const response = await clientService.getProfil();
      const userData = response.data;
      setValue('nomComplet', userData.nomComplet);
      setValue('email', userData.email);
      setValue('adresse', userData.adresse || '');
    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitProfil = async (data: ProfilForm) => {
    setUpdating(true);
    try {
      await clientService.updateProfil(data);
      updateUser(data);
      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    setChangingPassword(true);
    try {
      await authService.changePassword(data.ancienMotDePasse, data.nouveauMotDePasse);
      toast.success('Mot de passe modifié avec succès !');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Mon Profil</h1>
          <p style={{ color: '#6b7280' }}>Gérez vos informations personnelles et paramètres de sécurité</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Informations personnelles */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#2563eb" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Informations personnelles</h2>
              </div>
            </div>

            <form onSubmit={handleSubmitProfil(onSubmitProfil)} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Nom complet
                </label>
                <input
                  {...registerProfil('nomComplet')}
                  type="text"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
                {profilErrors.nomComplet && (
                  <p style={{ marginTop: '4px', fontSize: '13px', color: '#dc2626' }}>{profilErrors.nomComplet.message}</p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  {...registerProfil('email')}
                  type="email"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
                {profilErrors.email && (
                  <p style={{ marginTop: '4px', fontSize: '13px', color: '#dc2626' }}>{profilErrors.email.message}</p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={user?.telephone || ''}
                  disabled
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f9fafb', color: '#6b7280' }}
                />
                <p style={{ marginTop: '4px', fontSize: '13px', color: '#6b7280' }}>Le numéro de téléphone ne peut pas être modifié</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Adresse
                </label>
                <textarea
                  {...registerProfil('adresse')}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                  placeholder="Votre adresse complète"
                />
                {profilErrors.adresse && (
                  <p style={{ marginTop: '4px', fontSize: '13px', color: '#dc2626' }}>{profilErrors.adresse.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updating}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: updating ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: updating ? 'not-allowed' : 'pointer' }}
              >
                <Save size={16} style={{ marginRight: '8px' }} />
                {updating ? 'Mise à jour...' : 'Sauvegarder'}
              </button>
            </form>
          </div>

          {/* Changement de mot de passe */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={20} color="#dc2626" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Sécurité</h2>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Mot de passe actuel
                </label>
                <input
                  {...registerPassword('ancienMotDePasse')}
                  type="password"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
                {passwordErrors.ancienMotDePasse && (
                  <p style={{ marginTop: '4px', fontSize: '13px', color: '#dc2626' }}>{passwordErrors.ancienMotDePasse.message}</p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Nouveau mot de passe
                </label>
                <input
                  {...registerPassword('nouveauMotDePasse')}
                  type="password"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
                {passwordErrors.nouveauMotDePasse && (
                  <p style={{ marginTop: '4px', fontSize: '13px', color: '#dc2626' }}>{passwordErrors.nouveauMotDePasse.message}</p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  {...registerPassword('confirmerMotDePasse')}
                  type="password"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
                {passwordErrors.confirmerMotDePasse && (
                  <p style={{ marginTop: '4px', fontSize: '13px', color: '#dc2626' }}>{passwordErrors.confirmerMotDePasse.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: changingPassword ? '#9ca3af' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: changingPassword ? 'not-allowed' : 'pointer' }}
              >
                <Lock size={16} style={{ marginRight: '8px' }} />
                {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        </div>

        {/* Informations du compte */}
        <div style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Informations du compte</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Rôle</p>
              <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
