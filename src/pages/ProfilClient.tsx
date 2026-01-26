import { useEffect, useState } from 'react';
import { User, Mail, Phone, Lock } from 'lucide-react';

interface Profil {
  nomComplet: string;
  email: string;
  telephone: string;
}

export default function ProfilClient() {
  const [profil, setProfil] = useState<Profil>({ nomComplet: '', email: '', telephone: '' });
  const [editing, setEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ ancien: '', nouveau: '', confirmation: '' });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:8081/api/client/profil`, {
          headers: { 'X-User-Id': userId || '' }
        });
        if (response.ok) {
          setProfil(await response.json());
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchProfil();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/client/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify(profil)
      });
      if (response.ok) {
        setEditing(false);
        alert('Profil mis à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.nouveau !== passwordForm.confirmation) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/auth/changer-mot-de-passe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({
          ancienMotDePasse: passwordForm.ancien,
          nouveauMotDePasse: passwordForm.nouveau
        })
      });
      if (response.ok) {
        alert('Mot de passe modifié');
        setPasswordForm({ ancien: '', nouveau: '', confirmation: '' });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Informations personnelles</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-600 hover:underline"
          >
            {editing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                value={profil.nomComplet}
                onChange={(e) => setProfil({ ...profil, nomComplet: e.target.value })}
                disabled={!editing}
                className="flex-1 px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="email"
                value={profil.email}
                onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                disabled={!editing}
                className="flex-1 px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="tel"
                value={profil.telephone}
                onChange={(e) => setProfil({ ...profil, telephone: e.target.value })}
                disabled={!editing}
                className="flex-1 px-4 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          {editing && (
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Enregistrer
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="space-y-4">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="Ancien mot de passe"
                value={passwordForm.ancien}
                onChange={(e) => setPasswordForm({ ...passwordForm, ancien: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwordForm.nouveau}
                onChange={(e) => setPasswordForm({ ...passwordForm, nouveau: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordForm.confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmation: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Modifier le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
