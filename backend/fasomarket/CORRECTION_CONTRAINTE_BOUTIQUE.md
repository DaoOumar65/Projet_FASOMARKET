# 🔧 Correction Contrainte Statut Boutiques

## ❌ Problème Identifié
Erreur de contrainte de vérification : `shops_status_check` ne reconnaît pas le statut `EN_ATTENTE_APPROBATION`.

```
ERREUR: la nouvelle ligne de la relation « shops » viole la contrainte de vérification « shops_status_check »
```

## ✅ Solutions

### Option 1: Script SQL (Recommandé)
Exécutez le script `fix-shop-status-constraint.sql` :

```sql
-- Supprimer l'ancienne contrainte
ALTER TABLE shops DROP CONSTRAINT IF EXISTS shops_status_check;

-- Ajouter la nouvelle contrainte avec tous les statuts
ALTER TABLE shops ADD CONSTRAINT shops_status_check 
CHECK (status IN ('BROUILLON', 'EN_ATTENTE_APPROBATION', 'ACTIVE', 'REJETEE', 'SUSPENDUE'));
```

### Option 2: Recréer la Table (Si nécessaire)
```sql
-- Sauvegarder les données existantes
CREATE TABLE shops_backup AS SELECT * FROM shops;

-- Supprimer et recréer la table
DROP TABLE shops CASCADE;

-- Redémarrer l'application pour recréer la table avec Hibernate
-- Puis restaurer les données si nécessaire
```

## 🔧 Corrections Code

### 1. ShopService
- ✅ Statut initial défini explicitement comme `BROUILLON`
- ✅ Évite les conflits de contrainte

### 2. Statuts Valides
```java
public enum ShopStatus {
    BROUILLON,                  // En cours de création
    EN_ATTENTE_APPROBATION,     // Soumise pour validation  
    ACTIVE,                     // Approuvée et active
    REJETEE,                    // Rejetée par admin
    SUSPENDUE                   // Suspendue par admin
}
```

## 🧪 Test de Création Boutique

```bash
curl -X POST "http://localhost:8081/api/vendeur/boutiques/creer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: VENDOR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test Boutique",
    "description": "Description test",
    "telephone": "+22665300001",
    "adresse": "Ouagadougou",
    "email": "test@boutique.com",
    "categorie": "Mode"
  }'
```

## ✅ Résultat Attendu

Après correction, la boutique sera créée avec :
- ✅ Statut: `BROUILLON`
- ✅ Pas d'erreur de contrainte
- ✅ Possibilité de soumettre pour validation

## 🎯 Actions Immédiates

1. **Exécuter le script SQL** pour corriger la contrainte
2. **Redémarrer l'application** Spring Boot
3. **Tester la création** de boutique
4. **Vérifier** que le statut est bien `BROUILLON`