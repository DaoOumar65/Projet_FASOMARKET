# 🔧 Correction API Validation Vendeur

## ❌ Problème Identifié
L'endpoint `/api/admin/vendeurs/{vendorId}/valider` nécessite le paramètre `statut` obligatoire.

**Erreur actuelle :**
```
Required request parameter 'statut' for method parameter type VendorStatus is not present
```

## ✅ Solution Frontend

### 1. Appel API Correct
```typescript
// ❌ INCORRECT - Manque le paramètre statut
PUT /api/admin/vendeurs/aab82296-4455-41d0-aefa-ee05668db803/valider

// ✅ CORRECT - Avec paramètre statut
PUT /api/admin/vendeurs/aab82296-4455-41d0-aefa-ee05668db803/valider?statut=COMPTE_VALIDE
```

### 2. Service API Mis à Jour
```typescript
// services/apiService.ts
class ApiService {
  // Approuver un vendeur
  async approuverVendeur(vendorId: string, raison?: string) {
    const params = new URLSearchParams();
    params.append('statut', 'COMPTE_VALIDE');
    if (raison) params.append('raison', raison);
    
    return this.api.put(`/api/admin/vendeurs/${vendorId}/valider?${params}`);
  }

  // Rejeter un vendeur
  async rejeterVendeur(vendorId: string, raison: string) {
    const params = new URLSearchParams();
    params.append('statut', 'REFUSE');
    params.append('raison', raison);
    
    return this.api.put(`/api/admin/vendeurs/${vendorId}/valider?${params}`);
  }

  // Méthode générique
  async validerVendeur(vendorId: string, statut: 'COMPTE_VALIDE' | 'REFUSE', raison?: string) {
    const params = new URLSearchParams();
    params.append('statut', statut);
    if (raison) params.append('raison', raison);
    
    return this.api.put(`/api/admin/vendeurs/${vendorId}/valider?${params}`);
  }
}
```

### 3. Composant de Validation
```typescript
// components/ValidationVendeur.tsx
import { useState } from 'react';
import { apiService } from '../services/apiService';

interface Vendor {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
  status: string;
}

export const ValidationVendeur = ({ vendor }: { vendor: Vendor }) => {
  const [loading, setLoading] = useState(false);
  const [raison, setRaison] = useState('');

  const handleApprouver = async () => {
    try {
      setLoading(true);
      await apiService.validerVendeur(vendor.id, 'COMPTE_VALIDE');
      alert('Vendeur approuvé avec succès');
      // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async () => {
    if (!raison.trim()) {
      alert('Veuillez saisir une raison pour le rejet');
      return;
    }

    try {
      setLoading(true);
      await apiService.validerVendeur(vendor.id, 'REFUSE', raison);
      alert('Vendeur rejeté avec succès');
      // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-validation">
      <h3>{vendor.user.fullName}</h3>
      <p>Email: {vendor.user.email}</p>
      <p>Statut: {vendor.status}</p>
      
      <div className="actions">
        <button 
          onClick={handleApprouver} 
          disabled={loading}
          className="btn-approve"
        >
          Approuver
        </button>
        
        <div className="reject-section">
          <textarea
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
            placeholder="Raison du rejet (obligatoire)"
            rows={3}
          />
          <button 
            onClick={handleRejeter} 
            disabled={loading || !raison.trim()}
            className="btn-reject"
          >
            Rejeter
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 4. Valeurs de Statut Autorisées
```typescript
// types/vendor.ts
export enum VendorStatus {
  EN_ATTENTE_VALIDATION = 'EN_ATTENTE_VALIDATION',
  COMPTE_VALIDE = 'COMPTE_VALIDE',
  REFUSE = 'REFUSE'
}
```

### 5. Test avec cURL
```bash
# Approuver un vendeur
curl -X PUT "http://localhost:8081/api/admin/vendeurs/aab82296-4455-41d0-aefa-ee05668db803/valider?statut=COMPTE_VALIDE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"

# Rejeter un vendeur avec raison
curl -X PUT "http://localhost:8081/api/admin/vendeurs/aab82296-4455-41d0-aefa-ee05668db803/valider?statut=REFUSE&raison=Documents%20incomplets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```

## 📋 Paramètres Requis

| Paramètre | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `statut` | VendorStatus | ✅ Oui | `COMPTE_VALIDE` ou `REFUSE` |
| `raison` | String | ❌ Non | Raison du rejet (recommandé pour REFUSE) |

## 🎯 Action Immédiate

Mettez à jour votre appel API frontend pour inclure le paramètre `statut` :

```typescript
// Au lieu de :
PUT /api/admin/vendeurs/{id}/valider

// Utilisez :
PUT /api/admin/vendeurs/{id}/valider?statut=COMPTE_VALIDE
```