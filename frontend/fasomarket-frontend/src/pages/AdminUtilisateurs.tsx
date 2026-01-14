import { useState, useEffect } from 'react';
import { Users, Search, Filter, Ban, CheckCircle, Eye } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

interface Utilisateur {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'CLIENT' | 'VENDOR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUtilisateurs();
  }, [roleFilter, page]);

  const fetchUtilisateurs = async () => {
    try {
      const response = await adminService.getUtilisateurs(roleFilter || undefined, page, 20);
      const userData = response.data.utilisateurs || response.data.content || response.data || [];
      setUtilisateurs(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUtilisateurs([]);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    try {
      if (isActive) {
        await adminService.bloquerUtilisateur(userId);
        toast.success('Utilisateur bloqué');
      } else {
        await adminService.debloquerUtilisateur(userId);
        toast.success('Utilisateur débloqué');
      }
      fetchUtilisateurs();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = Array.isArray(utilisateurs) ? utilisateurs.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getRoleBadge = (role: string) => {
    const colors = {
      CLIENT: { bg: '#dbeafe', text: '#1d4ed8' },
      VENDOR: { bg: '#dcfce7', text: '#16a34a' },
      ADMIN: { bg: '#fee2e2', text: '#dc2626' }
    };
    const color = colors[role as keyof typeof colors] || colors.CLIENT;
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: color.bg,
        color: color.text
      }}>
        {role}
      </span>
    );
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Gestion des utilisateurs</h1>
          <p style={{ color: '#6b7280' }}>{filteredUsers.length} utilisateurs trouvés</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Recherche */}
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Filtre par rôle */}
          <div style={{ position: 'relative' }}>
            <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="">Tous les rôles</option>
              <option value="CLIENT">Clients</option>
              <option value="VENDOR">Vendeurs</option>
              <option value="ADMIN">Administrateurs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: '16px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            <div>Utilisateur</div>
            <div>Rôle</div>
            <div>Téléphone</div>
            <div>Inscription</div>
            <div>Statut</div>
            <div>Actions</div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Users size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '18px' }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div>
            {filteredUsers.map((user) => (
              <div key={user.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>{user.fullName}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{user.email}</p>
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{user.phone}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                      color: user.isActive ? '#16a34a' : '#dc2626'
                    }}>
                      {user.isActive ? 'Actif' : 'Bloqué'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      disabled={actionLoading === user.id || user.role === 'ADMIN'}
                      style={{
                        padding: '6px',
                        backgroundColor: user.isActive ? '#fee2e2' : '#dcfce7',
                        color: user.isActive ? '#dc2626' : '#16a34a',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: user.role === 'ADMIN' ? 'not-allowed' : 'pointer',
                        opacity: user.role === 'ADMIN' ? 0.5 : 1
                      }}
                      title={user.role === 'ADMIN' ? 'Impossible de modifier un admin' : (user.isActive ? 'Bloquer' : 'Débloquer')}
                    >
                      {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}