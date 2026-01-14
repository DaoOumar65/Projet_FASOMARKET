// 🔐 INTÉGRATION FRONTEND FASOMARKET - AUTHENTIFICATION & API

// ===== CONFIGURATION API =====
const API_BASE_URL = 'http://localhost:8000/api';

class FasoMarketAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Configuration des headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Requête générique
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expirée');
        }
        throw new Error(data.message || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // ===== AUTHENTIFICATION =====
  auth = {
    // Inscription client
    async registerClient(nom, prenom, telephone, password) {
      return await this.request('/inscription-client', {
        method: 'POST',
        body: JSON.stringify({ nom, prenom, telephone, password }),
        auth: false
      });
    },

    // Inscription vendeur
    async registerVendeur(data) {
      return await this.request('/inscription-vendeur', {
        method: 'POST',
        body: JSON.stringify(data),
        auth: false
      });
    },

    // Connexion
    async login(identifiant, password) {
      const response = await this.request('/connexion', {
        method: 'POST',
        body: JSON.stringify({ identifiant, password }),
        auth: false
      });
      
      if (response.success) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    },

    // Déconnexion
    async logout() {
      try {
        await this.request('/deconnexion', { method: 'POST' });
      } finally {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    // Profil utilisateur
    async getProfile() {
      return await this.request('/profil');
    },

    // OTP
    async sendOTP(telephone, type = 'inscription') {
      return await this.request('/envoyer-otp', {
        method: 'POST',
        body: JSON.stringify({ telephone, type }),
        auth: false
      });
    },

    async verifyOTP(telephone, code) {
      return await this.request('/verifier-otp', {
        method: 'POST',
        body: JSON.stringify({ telephone, code }),
        auth: false
      });
    }
  };

  // ===== ACCUEIL =====
  accueil = {
    // Données complètes d'accueil
    async getDonneesCompletes() {
      return await this.request('/accueil/donnees-completes', { auth: false });
    },

    // Statistiques
    async getStatistiques() {
      return await this.request('/accueil/statistiques', { auth: false });
    },

    // Produits vedettes
    async getProduitsVedettes() {
      return await this.request('/accueil/produits-vedettes', { auth: false });
    },

    // Boutiques populaires
    async getBoutiquesPopulaires() {
      return await this.request('/accueil/boutiques-populaires', { auth: false });
    }
  };

  // ===== PRODUITS =====
  produits = {
    async getAll() {
      return await this.request('/produits-publics', { auth: false });
    },

    async getById(id) {
      return await this.request(`/produit-public/${id}`, { auth: false });
    },

    async search(query) {
      return await this.request(`/rechercher-produits?q=${encodeURIComponent(query)}`, { auth: false });
    }
  };

  // ===== COMMANDES =====
  commandes = {
    async getMesCommandes() {
      return await this.request('/mes-commandes');
    },

    async passerCommande(data) {
      return await this.request('/passer-commande', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async changerStatut(commandeId, statut) {
      return await this.request(`/commandes/${commandeId}/statut`, {
        method: 'PUT',
        body: JSON.stringify({ statut })
      });
    }
  };

  // ===== PANIER =====
  panier = {
    async get() {
      return await this.request('/panier');
    },

    async ajouter(produitId, quantite) {
      return await this.request('/panier/ajouter', {
        method: 'POST',
        body: JSON.stringify({ produit_id: produitId, quantite })
      });
    },

    async vider() {
      return await this.request('/panier/vider', { method: 'DELETE' });
    }
  };
}

// Instance globale
const fasoMarketAPI = new FasoMarketAPI();

// ===== COMPOSANTS REACT =====

// Hook pour l'authentification
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifiant, password) => {
    try {
      const response = await fasoMarketAPI.auth.login(identifiant, password);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await fasoMarketAPI.auth.logout();
    setUser(null);
  };

  const isClient = user?.type_utilisateur === 'client';
  const isVendeur = user?.type_utilisateur === 'vendeur';
  const isAdmin = user?.type_utilisateur === 'admin';

  return { user, login, logout, loading, isClient, isVendeur, isAdmin };
}

// Composant de connexion
function LoginForm() {
  const [credentials, setCredentials] = useState({
    identifiant: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(credentials.identifiant, credentials.password);
      
      if (response.success) {
        // Redirection selon le type d'utilisateur
        if (response.user.type_utilisateur === 'vendeur') {
          navigate('/dashboard-vendeur');
        } else {
          navigate('/boutiques');
        }
      }
    } catch (error) {
      setError(error.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Connexion</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Email ou téléphone"
        value={credentials.identifiant}
        onChange={(e) => setCredentials({...credentials, identifiant: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Mot de passe"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}

// Composant d'inscription client
function RegisterClientForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fasoMarketAPI.auth.registerClient(
        formData.nom,
        formData.prenom,
        formData.telephone,
        formData.password
      );
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/boutiques');
      }
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Inscription Client</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Nom"
        value={formData.nom}
        onChange={(e) => setFormData({...formData, nom: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Prénom"
        value={formData.prenom}
        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Téléphone"
        value={formData.telephone}
        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Mot de passe (4-20 caractères)"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        minLength="4"
        maxLength="20"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Inscription...' : 'S\'inscrire'}
      </button>
    </form>
  );
}

// Composant page d'accueil
function AccueilPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccueilData = async () => {
      try {
        const response = await fasoMarketAPI.accueil.getDonneesCompletes();
        setData(response.data);
      } catch (error) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur accueil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccueilData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div>Aucune donnée disponible</div>;

  return (
    <div className="accueil-page">
      {/* Statistiques */}
      <section className="stats">
        <h2>FasoMarket en chiffres</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="number">{data.statistiques.produits}</span>
            <span className="label">Produits</span>
          </div>
          <div className="stat-item">
            <span className="number">{data.statistiques.boutiques}</span>
            <span className="label">Boutiques</span>
          </div>
          <div className="stat-item">
            <span className="number">{data.statistiques.clients}</span>
            <span className="label">Clients</span>
          </div>
          <div className="stat-item">
            <span className="number">{data.statistiques.vendeurs}</span>
            <span className="label">Vendeurs</span>
          </div>
        </div>
      </section>

      {/* Produits vedettes */}
      <section className="produits-vedettes">
        <h2>Produits vedettes</h2>
        <div className="produits-grid">
          {data.produits_vedettes.map(produit => (
            <div key={produit.id} className="produit-card">
              <img src={produit.images?.[0] || '/placeholder.jpg'} alt={produit.nom} />
              <h3>{produit.nom}</h3>
              <p className="prix">{produit.prix} FCFA</p>
              <p className="boutique">{produit.boutique?.nom_boutique}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Boutiques populaires */}
      <section className="boutiques-populaires">
        <h2>Boutiques populaires</h2>
        <div className="boutiques-grid">
          {data.boutiques_populaires.map(boutique => (
            <div key={boutique.id} className="boutique-card">
              <img src={boutique.logo || '/placeholder.jpg'} alt={boutique.nom_boutique} />
              <h3>{boutique.nom_boutique}</h3>
              <p>{boutique.produits_count} produits</p>
              <p>Note: {boutique.note_moyenne || 'N/A'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Route protégée
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  
  if (!user) {
    return <Navigate to="/connexion" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.type_utilisateur)) {
    return <Navigate to="/non-autorise" />;
  }
  
  return children;
}

// Configuration des routes
function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<AccueilPage />} />
      <Route path="/connexion" element={<LoginForm />} />
      <Route path="/inscription" element={<RegisterClientForm />} />
      
      {/* Routes client */}
      <Route path="/boutiques" element={
        <ProtectedRoute allowedRoles={['client']}>
          <BoutiquesPage />
        </ProtectedRoute>
      } />
      
      {/* Routes vendeur */}
      <Route path="/dashboard-vendeur" element={
        <ProtectedRoute allowedRoles={['vendeur']}>
          <DashboardVendeur />
        </ProtectedRoute>
      } />
      
      {/* Route d'erreur */}
      <Route path="/non-autorise" element={<div>Accès non autorisé</div>} />
    </Routes>
  );
}

// Export pour utilisation
export { fasoMarketAPI, useAuth, LoginForm, RegisterClientForm, AccueilPage, ProtectedRoute, AppRoutes };