# 📧 Ajouter Email à Dissa Haroun

## 🎯 Objectif
Ajouter un email à l'utilisateur "Dissa Haroun" (+22625252521) pour qu'il puisse recevoir les notifications email.

## 🔧 Solutions

### Option 1: Via SQL (Recommandé)
```sql
-- Exécuter dans PostgreSQL
UPDATE users 
SET email = 'dissa.haroun@fasomarket.com'
WHERE full_name = 'Dissa Haroun' 
  AND phone = '+22625252521';
```

### Option 2: Via API
```bash
# Trouver l'ID de l'utilisateur d'abord
curl -X GET "http://localhost:8081/api/admin/utilisateurs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"

# Puis mettre à jour l'email
curl -X PUT "http://localhost:8081/api/admin/utilisateurs/USER_ID/email?email=dissa.haroun@fasomarket.com" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```

### Option 3: Via Frontend
```typescript
// Dans votre interface admin
const updateUserEmail = async (userId: string, email: string) => {
  try {
    const response = await apiService.put(
      `/api/admin/utilisateurs/${userId}/email?email=${email}`
    );
    alert('Email mis à jour avec succès');
  } catch (error) {
    alert('Erreur lors de la mise à jour');
  }
};
```

## 📋 Informations Utilisateur

**Nom:** Dissa Haroun  
**Téléphone:** +22625252521  
**Email à ajouter:** dissa.haroun@fasomarket.com  
**Carte ID:** B20202020  
**Date création:** 13/01/2026  

## ✅ Vérification

Après mise à jour, vérifiez avec :

```sql
SELECT id, full_name, phone, email, role 
FROM users 
WHERE full_name = 'Dissa Haroun';
```

## 🧪 Test Email

Une fois l'email ajouté, testez la validation du vendeur :

```bash
curl -X PUT "http://localhost:8081/api/admin/vendeurs/VENDOR_ID/valider?statut=COMPTE_VALIDE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```

L'email de simulation devrait maintenant s'afficher dans les logs avec la bonne adresse email.