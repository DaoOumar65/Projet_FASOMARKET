# 💳 Guide de Test - Système de Paiement FasoMarket

## 🔧 Configuration Actuelle

**Provider**: PayDunya (Mode TEST)
**Endpoints Base**: `http://localhost:8081/api`

---

## 📋 Problèmes Corrigés

### ✅ 1. Endpoints manquants
- Ajouté `/api/client/paiements/payer` pour les clients
- Ajouté `/api/client/paiements/historique` pour l'historique

### ✅ 2. Gestion d'erreurs améliorée
- Validation du transactionId dans le webhook
- Logs détaillés pour le débogage
- Gestion des erreurs de facture/notification

### ✅ 3. Mode TEST optimisé
- URL de redirection avec orderId
- Message clair sur le mode test
- TransactionId plus lisible

---

## 🧪 Tests à Effectuer

### Test 1: Initier un Paiement

```bash
POST http://localhost:8081/api/paiements/initier
Content-Type: application/json

{
  "commandeId": "VOTRE_COMMANDE_ID",
  "userId": "VOTRE_USER_ID",
  "montant": 15000,
  "modePaiement": "ORANGE_MONEY",
  "numeroTelephone": "+22670123456",
  "email": "client@example.com",
  "nomClient": "Jean Dupont"
}
```

**Réponse Attendue (Mode TEST)**:
```json
{
  "success": true,
  "paymentUrl": "http://localhost:5173/paiement/test?token=test_paydunya_xxxxx&orderId=xxxxx",
  "transactionId": "test_paydunya_xxxxx",
  "commandeId": "xxxxx",
  "montant": 15000,
  "mode": "test",
  "provider": "PayDunya",
  "message": "Mode TEST - Utilisez les endpoints /simuler-succes ou /simuler-echec"
}
```

### Test 2: Simuler Paiement Réussi

```bash
POST http://localhost:8081/api/paiements/simuler-succes/{transactionId}
```

**Résultat**:
- Payment status → COMPLETED
- Order status → PAID
- Facture générée
- Notification envoyée

### Test 3: Simuler Paiement Échoué

```bash
POST http://localhost:8081/api/paiements/simuler-echec/{transactionId}
```

**Résultat**:
- Payment status → FAILED
- Order status → CANCELLED

### Test 4: Vérifier Statut

```bash
GET http://localhost:8081/api/paiements/statut/{transactionId}
```

**Réponse**:
```json
{
  "transactionId": "test_paydunya_xxxxx",
  "status": "COMPLETED",
  "montant": 15000,
  "commandeId": "xxxxx",
  "dateCreation": "2026-01-09T...",
  "provider": "PayDunya"
}
```

### Test 5: Historique Client

```bash
GET http://localhost:8081/api/client/paiements/historique
Headers: X-User-Id: {clientId}
```

---

## 🔍 Vérifications Base de Données

### Table `payments`
```sql
SELECT 
    id, 
    transaction_id, 
    amount, 
    status, 
    payment_method,
    payment_date,
    created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
```

### Vérifier Commande Payée
```sql
SELECT 
    o.id,
    o.status,
    p.transaction_id,
    p.status as payment_status,
    p.amount
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.id = 'VOTRE_COMMANDE_ID';
```

---

## 🚨 Problèmes Potentiels & Solutions

### Problème 1: "Commande non trouvée"
**Cause**: CommandeId invalide ou commande n'existe pas
**Solution**: Vérifier que la commande existe et est en statut PENDING

### Problème 2: "Paiement non trouvé" dans webhook
**Cause**: TransactionId ne correspond pas
**Solution**: Vérifier que le transactionId est correct dans la requête

### Problème 3: Webhook ne met pas à jour la commande
**Cause**: Erreur dans la génération de facture ou notification
**Solution**: Vérifier les logs, les erreurs sont maintenant catchées

### Problème 4: Clés PayDunya invalides
**Cause**: Clés de test par défaut
**Solution**: 
1. Créer un compte sur https://paydunya.com
2. Obtenir vos clés API (mode test)
3. Mettre à jour dans `application.properties`:
```properties
payment.paydunya.master-key=VOTRE_MASTER_KEY
payment.paydunya.private-key=VOTRE_PRIVATE_KEY
payment.paydunya.token=VOTRE_TOKEN
```

---

## 🔄 Flux Complet de Paiement

```
1. Client crée une commande
   └─> Order status: PENDING

2. Client initie le paiement
   POST /api/client/paiements/payer
   └─> Payment créé avec status: PENDING
   └─> Retourne paymentUrl

3. Client redirigé vers PayDunya (ou page test)
   └─> Client effectue le paiement

4. PayDunya envoie webhook
   POST /api/paiements/webhook
   └─> Payment status: COMPLETED
   └─> Order status: PAID
   └─> Facture générée
   └─> Notifications envoyées

5. Client redirigé vers page succès
   └─> Affiche confirmation et facture
```

---

## 📝 Checklist de Déploiement Production

- [ ] Obtenir vraies clés API PayDunya
- [ ] Changer `payment.paydunya.mode=live`
- [ ] Configurer webhook URL publique
- [ ] Configurer URLs de redirection (success/cancel)
- [ ] Tester avec petits montants réels
- [ ] Activer logs de paiement
- [ ] Configurer alertes en cas d'échec
- [ ] Documenter procédure de remboursement

---

## 🆘 Support

**Logs à vérifier**:
- Console Spring Boot pour erreurs webhook
- Table `payments` pour statuts
- Table `orders` pour changements de statut

**Documentation PayDunya**: https://paydunya.com/developers

**Contact Support FasoMarket**: support@fasomarket.bf
