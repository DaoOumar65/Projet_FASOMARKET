# 🔧 Correction Paramètre Statut Boutique

## ❌ Problème Identifié
```
Required request parameter 'statut' for method parameter type ShopStatus is not present
```

L'endpoint pour changer le statut d'une boutique manque le paramètre `statut`.

## 🔍 Endpoint Concerné
`PUT /api/admin/boutiques/{id}/statut`

## ✅ Solution Frontend

### Appel API Correct
```typescript
// ❌ INCORRECT - Manque le paramètre statut
PUT /api/admin/boutiques/a486090e-b015-492f-ac3e-fd1508530d26/statut

// ✅ CORRECT - Avec paramètre statut
PUT /api/admin/boutiques/a486090e-b015-492f-ac3e-fd1508530d26/statut?statut=ACTIVE
```

### Service API
```typescript
class ApiService {
  // Approuver une boutique
  async approuverBoutique(boutiqueId: string) {
    return this.api.put(`/api/admin/boutiques/${boutiqueId}/statut?statut=ACTIVE`);
  }

  // Rejeter une boutique
  async rejeterBoutique(boutiqueId: string) {
    return this.api.put(`/api/admin/boutiques/${boutiqueId}/statut?statut=REJETEE`);
  }

  // Suspendre une boutique
  async suspendreBoutique(boutiqueId: string) {
    return this.api.put(`/api/admin/boutiques/${boutiqueId}/statut?statut=SUSPENDUE`);
  }

  // Méthode générique
  async changerStatutBoutique(boutiqueId: string, statut: ShopStatus) {
    return this.api.put(`/api/admin/boutiques/${boutiqueId}/statut?statut=${statut}`);
  }
}
```

### Composant de Gestion
```typescript
const GestionBoutique = ({ boutique }) => {
  const [loading, setLoading] = useState(false);

  const handleApprouver = async () => {
    try {
      setLoading(true);
      await apiService.changerStatutBoutique(boutique.id, 'ACTIVE');
      alert('Boutique approuvée');
    } catch (error) {
      alert('Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async () => {
    try {
      setLoading(true);
      await apiService.changerStatutBoutique(boutique.id, 'REJETEE');
      alert('Boutique rejetée');
    } catch (error) {
      alert('Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>{boutique.nom}</h3>
      <p>Statut: {boutique.statut}</p>
      <button onClick={handleApprouver} disabled={loading}>
        Approuver
      </button>
      <button onClick={handleRejeter} disabled={loading}>
        Rejeter
      </button>
    </div>
  );
};
```

## 📋 Statuts Valides

```typescript
enum ShopStatus {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE_APPROBATION = 'EN_ATTENTE_APPROBATION',
  ACTIVE = 'ACTIVE',
  REJETEE = 'REJETEE',
  SUSPENDUE = 'SUSPENDUE'
}
```

## 🧪 Test avec cURL

```bash
# Approuver une boutique
curl -X PUT "http://localhost:8081/api/admin/boutiques/a486090e-b015-492f-ac3e-fd1508530d26/statut?statut=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"

# Rejeter une boutique
curl -X PUT "http://localhost:8081/api/admin/boutiques/a486090e-b015-492f-ac3e-fd1508530d26/statut?statut=REJETEE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```

## 🎯 Actions Immédiates

1. **Ajouter le paramètre `statut`** à tous les appels de changement de statut
2. **Utiliser des UUIDs valides** pour les IDs de boutique
3. **Tester avec les valeurs** : `ACTIVE`, `REJETEE`, `SUSPENDUE`

## ✅ Format Final

```
PUT /api/admin/boutiques/{boutiqueId}/statut?statut={STATUT_VALIDE}
```

## 📧 Configuration Emails

### 📋 Statut Actuel
- ✅ **Emails de simulation** dans les logs du terminal
- ❌ **Vrais emails** non configurés

### 🔧 Pour Recevoir de Vrais Emails

**Option 1: Configuration Gmail SMTP**
1. Ajouter `spring-boot-starter-mail` au pom.xml
2. Configurer Gmail SMTP dans application.properties
3. Modifier EmailService pour utiliser JavaMailSender

**Option 2: Garder la Simulation (Recommandé pour le développement)**
- Les logs du terminal suffisent pour tester
- Plus simple et plus rapide
- Pas de configuration SMTP nécessaire

### 🎯 Recommandation

Pour l'instant, gardez les emails de simulation. Ils sont parfaits pour :
- ✅ Tester la validation des vendeurs/boutiques
- ✅ Vérifier que les notifications fonctionnent
- ✅ Développer l'interface admin

## 👥 Validation des Vendeurs

### 📋 Statut Actuel Vendeurs
- ✅ **Emails de simulation** dans les logs du terminal
- ❌ **Vrais emails** non configurés

### 🔧 Endpoints Vendeurs

```bash
# Approuver un vendeur
PUT /api/admin/vendeurs/{vendorId}/valider?statut=COMPTE_VALIDE

# Rejeter un vendeur avec raison
PUT /api/admin/vendeurs/{vendorId}/valider?statut=REFUSE&raison=Documents manquants
```

### 📧 Emails Vendeurs Disponibles

**Approbation Vendeur:**
```
=== EMAIL APPROBATION VENDEUR ===
À: vendeur@example.com
Sujet: Votre compte vendeur FasoMarket a été approuvé
Message:
Bonjour Jean Dupont,
Félicitations ! Votre compte vendeur a été approuvé...
```

**Rejet Vendeur:**
```
=== EMAIL REJET VENDEUR ===
À: vendeur@example.com
Sujet: Votre demande vendeur FasoMarket
Message:
Bonjour Jean Dupont,
Nous regrettons de vous informer...
```

### 🧪 Test Vendeurs

```bash
# Approuver Dissa Haroun
curl -X PUT "http://localhost:8081/api/admin/vendeurs/USER_ID/valider?statut=COMPTE_VALIDE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"

# Rejeter un vendeur
curl -X PUT "http://localhost:8081/api/admin/vendeurs/USER_ID/valider?statut=REFUSE&raison=Documents incomplets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```