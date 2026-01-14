# Endpoint de Validation des Boutiques

## 🔧 Correction Paramètre Statut Boutique

### ❌ Problème Identifié
```
Required request parameter 'statut' for method parameter type ShopStatus is not present
```

### ✅ Solution
L'endpoint `/api/admin/boutiques/{id}/statut` nécessite le paramètre `statut` :
```
// ❌ INCORRECT
PUT /api/admin/boutiques/{id}/statut

// ✅ CORRECT
PUT /api/admin/boutiques/{id}/statut?statut=ACTIVE
```

## Endpoints à ajouter dans AdminController.java

```java
@PutMapping("/boutiques/{id}/valider")
@Operation(summary = "Valider boutique", description = "Approuve ou rejette une boutique")
public ResponseEntity<?> validerBoutique(
        @RequestHeader("X-User-Id") UUID adminId,
        @PathVariable UUID id,
        @RequestParam ShopStatus statut,
        @RequestParam(required = false) String raison) {
    try {
        Shop boutique = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        boutique.setStatus(statut);
        
        if (statut == ShopStatus.ACTIVE) {
            boutique.setDateValidation(LocalDateTime.now());
            boutique.setValideParAdminId(adminId);
            shopRepository.save(boutique);

            // Notification au vendeur
            notificationService.creerNotification(
                    boutique.getVendor().getUser().getId(),
                    "Boutique Approuvée",
                    "Félicitations ! Votre boutique '" + boutique.getName() + "' a été approuvée et est maintenant active.");

            // Email au vendeur
            emailService.envoyerEmailApprobationBoutique(
                    boutique.getVendor().getUser().getEmail(),
                    boutique.getVendor().getUser().getFullName(),
                    boutique.getName());

            return ResponseEntity.ok("Boutique approuvée, notification et email envoyés");
            
        } else if (statut == ShopStatus.REJETEE) {
            boutique.setRaisonRejet(raison);
            shopRepository.save(boutique);

            // Notification au vendeur
            notificationService.creerNotification(
                    boutique.getVendor().getUser().getId(),
                    "Boutique Rejetée",
                    "Votre boutique '" + boutique.getName() + "' n'a pas été approuvée. " +
                            (raison != null ? "Raison: " + raison : ""));

            // Email au vendeur
            emailService.envoyerEmailRejetBoutique(
                    boutique.getVendor().getUser().getEmail(),
                    boutique.getVendor().getUser().getFullName(),
                    boutique.getName(),
                    raison);

            return ResponseEntity.ok("Boutique rejetée, notification et email envoyés");
        }

        shopRepository.save(boutique);
        return ResponseEntity.ok("Statut boutique mis à jour");
        
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Erreur lors de la validation: " + e.getMessage());
    }
}
```

## Champs à ajouter dans Shop.java

```java
@Column(name = "date_validation")
private LocalDateTime dateValidation;

@Column(name = "raison_rejet")
private String raisonRejet;

@Column(name = "valide_par_admin_id")
private UUID valideParAdminId;

// Getters et setters
public LocalDateTime getDateValidation() { return dateValidation; }
public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }

public String getRaisonRejet() { return raisonRejet; }
public void setRaisonRejet(String raisonRejet) { this.raisonRejet = raisonRejet; }

public UUID getValideParAdminId() { return valideParAdminId; }
public void setValideParAdminId(UUID valideParAdminId) { this.valideParAdminId = valideParAdminId; }
```

## Méthodes EmailService à ajouter

```java
public void envoyerEmailApprobationBoutique(String email, String nomVendeur, String nomBoutique) {
    String sujet = "Boutique approuvée - " + nomBoutique;
    String contenu = "Bonjour " + nomVendeur + ",\n\n" +
            "Félicitations ! Votre boutique '" + nomBoutique + "' a été approuvée.\n" +
            "Vous pouvez maintenant commencer à ajouter vos produits.\n\n" +
            "Cordialement,\nL'équipe FasoMarket";
    
    envoyerEmail(email, sujet, contenu);
}

public void envoyerEmailRejetBoutique(String email, String nomVendeur, String nomBoutique, String raison) {
    String sujet = "Boutique non approuvée - " + nomBoutique;
    String contenu = "Bonjour " + nomVendeur + ",\n\n" +
            "Votre boutique '" + nomBoutique + "' n'a pas été approuvée.\n" +
            (raison != null ? "Raison: " + raison + "\n\n" : "") +
            "Vous pouvez modifier votre boutique et la soumettre à nouveau.\n\n" +
            "Cordialement,\nL'équipe FasoMarket";
    
    envoyerEmail(email, sujet, contenu);
}
```

## Usage Frontend

### Statuts Valides
```typescript
enum ShopStatus {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE_APPROBATION = 'EN_ATTENTE_APPROBATION',
  ACTIVE = 'ACTIVE',
  REJETEE = 'REJETEE',
  SUSPENDUE = 'SUSPENDUE'
}
```

### Appels API
- Approbation: `PUT /api/admin/boutiques/{id}/valider?statut=ACTIVE`
- Rejet: `PUT /api/admin/boutiques/{id}/valider?statut=REJETEE&raison=Documents manquants`
- Changement statut: `PUT /api/admin/boutiques/{id}/statut?statut=SUSPENDUE`

### Service API Frontend
```typescript
class AdminService {
  // Validation avec raison (pour approbation/rejet)
  validerBoutique: (boutiqueId: string, statut: string, raison?: string) => {
    const params = new URLSearchParams();
    params.append('statut', statut);
    if (raison) params.append('raison', raison);
    return api.put(`/api/admin/boutiques/${boutiqueId}/valider?${params.toString()}`);
  },
  
  // Changement statut simple (pour suspension/réactivation)
  updateBoutiqueStatut: (id: string, statut: string) =>
    api.put(`/api/admin/boutiques/${id}/statut?statut=${statut}`)
}
```

## 🧠 Test avec cURL

```bash
# Approuver une boutique
curl -X PUT "http://localhost:8081/api/admin/boutiques/{id}/valider?statut=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"

# Rejeter avec raison
curl -X PUT "http://localhost:8081/api/admin/boutiques/{id}/valider?statut=REJETEE&raison=Documents manquants" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"

# Suspendre une boutique
curl -X PUT "http://localhost:8081/api/admin/boutiques/{id}/statut?statut=SUSPENDUE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
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