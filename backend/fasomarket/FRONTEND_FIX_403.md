# Guide d'Intégration Frontend - Éviter les Erreurs 403

## 🚨 Problème Résolu
Les erreurs 403 étaient causées par la configuration Spring Security qui bloquait les endpoints admin/vendeur.

## ✅ Configuration Backend Corrigée
La configuration de sécurité a été simplifiée pour autoriser toutes les requêtes pendant le développement.

## 📋 Instructions Frontend

### 1. Headers Requis
Tous les appels API doivent inclure le header `X-User-Id` :

```typescript
// Configuration Axios globale
const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'USER_ID_FROM_AUTH' // UUID de l'utilisateur connecté
  }
});
```

### 2. Gestion des Erreurs
Implémentez une gestion d'erreur robuste :

```typescript
// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Accès refusé - Vérifiez l\'authentification');
      // Rediriger vers login ou afficher message
    }
    return Promise.reject(error);
  }
);
```

### 3. Authentification
Stockez l'ID utilisateur après connexion :

```typescript
// Après connexion réussie
const loginResponse = await api.post('/api/auth/connexion', credentials);
const userId = loginResponse.data.userId;

// Stocker dans localStorage ou context
localStorage.setItem('userId', userId);

// Configurer pour toutes les requêtes suivantes
api.defaults.headers['X-User-Id'] = userId;
```

### 4. Composants Admin/Vendeur
Exemple d'appel API correct :

```typescript
// DashboardAdmin.tsx
const fetchDashboard = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await api.get('/api/admin/dashboard', {
      headers: { 'X-User-Id': userId }
    });
    setDashboardData(response.data);
  } catch (error) {
    console.error('Erreur dashboard:', error);
  }
};
```

### 5. Variables d'Environnement
Créez un fichier `.env` :

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_API_TIMEOUT=10000
```

### 6. Service API Centralisé
Créez un service API centralisé :

```typescript
// services/api.ts
class ApiService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: import.meta.env.VITE_API_TIMEOUT,
  });

  setAuthToken(userId: string) {
    this.api.defaults.headers['X-User-Id'] = userId;
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.api.get('/api/admin/dashboard');
  }

  async getUsers(page = 0, size = 20) {
    return this.api.get(`/api/admin/utilisateurs?page=${page}&size=${size}`);
  }

  // Vendeur endpoints
  async getVendeurDashboard() {
    return this.api.get('/api/vendeur/dashboard');
  }
}

export const apiService = new ApiService();
```

## 🔧 Actions Immédiates

1. **Redémarrez le backend** avec le script fourni
2. **Testez les endpoints** avec curl ou Postman
3. **Mettez à jour le frontend** avec les headers requis
4. **Implémentez la gestion d'erreur** robuste

## 🧪 Test Rapide
```bash
# Tester endpoint admin
curl -X GET "http://localhost:8081/api/admin/dashboard" -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000"

# Tester endpoint vendeur  
curl -X GET "http://localhost:8081/api/vendeur/dashboard" -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000"
```

## ⚠️ Important
- Toujours inclure le header `X-User-Id`
- Gérer les erreurs de réseau
- Vérifier que le backend est démarré
- Utiliser des UUID valides pour les tests