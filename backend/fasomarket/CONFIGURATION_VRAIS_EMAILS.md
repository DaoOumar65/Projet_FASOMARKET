# 📧 Configuration Vrais Emails - FasoMarket

## 📋 Statut Actuel
✅ **Emails de simulation** - Affichés dans les logs du terminal  
❌ **Vrais emails** - Non configurés

## 🔧 Pour Recevoir de Vrais Emails

### 1. Ajouter la Dépendance Mail
```xml
<!-- Dans pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 2. Configuration SMTP Gmail
```properties
# Dans application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

### 3. Créer un Mot de Passe d'Application Gmail
1. Aller dans **Compte Google** → **Sécurité**
2. Activer **Validation en 2 étapes**
3. Générer un **Mot de passe d'application**
4. Utiliser ce mot de passe dans `spring.mail.password`

### 4. Modifier EmailService pour Vrais Envois
```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void envoyerEmailApprobationVendeur(String email, String nomComplet, String motDePasseTemporaire) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Votre compte vendeur FasoMarket a été approuvé");
            message.setText(
                "Bonjour " + nomComplet + ",\n\n" +
                "Félicitations ! Votre compte vendeur a été approuvé.\n" +
                "Vous pouvez maintenant créer vos boutiques.\n\n" +
                "Cordialement,\nL'équipe FasoMarket"
            );
            
            mailSender.send(message);
            System.out.println("✅ Email envoyé à: " + email);
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email: " + e.getMessage());
            // Fallback vers simulation
            envoyerEmailSimulation(email, "Approbation Vendeur", nomComplet);
        }
    }
    
    public void envoyerEmailApprobationBoutique(String email, String nomComplet, String nomBoutique) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Boutique approuvée - " + nomBoutique);
            message.setText(
                "Bonjour " + nomComplet + ",\n\n" +
                "Excellente nouvelle ! Votre boutique '" + nomBoutique + "' a été approuvée.\n" +
                "Elle est maintenant visible sur FasoMarket.\n\n" +
                "Cordialement,\nL'équipe FasoMarket"
            );
            
            mailSender.send(message);
            System.out.println("✅ Email boutique envoyé à: " + email);
        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email: " + e.getMessage());
            // Fallback vers simulation
            envoyerEmailSimulationBoutique(email, nomComplet, nomBoutique);
        }
    }
    
    // Méthodes de simulation (fallback)
    private void envoyerEmailSimulation(String email, String sujet, String nom) {
        System.out.println("=== EMAIL SIMULATION ===");
        System.out.println("À: " + email);
        System.out.println("Sujet: " + sujet);
        System.out.println("Destinataire: " + nom);
        System.out.println("========================");
    }
}
```

## 🧪 Test Rapide

### Avec Configuration SMTP
```bash
# Les emails seront envoyés dans votre boîte Gmail
curl -X PUT "http://localhost:8081/api/admin/vendeurs/USER_ID/valider?statut=COMPTE_VALIDE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```

### Sans Configuration SMTP
```bash
# Les emails restent dans les logs du terminal (comme actuellement)
```

## 📱 Alternatives Recommandées

### 1. Service SMS (Plus adapté pour l'Afrique)
```java
@Service
public class SmsService {
    public void envoyerSmsApprobation(String telephone, String nom) {
        // Intégration avec Orange Money SMS API ou autre
        System.out.println("SMS envoyé à " + telephone + ": Compte approuvé!");
    }
}
```

### 2. Notifications Push
```java
@Service  
public class PushNotificationService {
    public void envoyerNotificationPush(UUID userId, String message) {
        // Intégration Firebase Cloud Messaging
    }
}
```

## 🎯 Recommandation

**Pour le développement :** Gardez les emails de simulation (logs)  
**Pour la production :** Configurez Gmail SMTP ou un service SMS local

## ✅ Statut Actuel Fonctionnel

Les emails de simulation dans les logs sont **parfaitement fonctionnels** pour :
- ✅ Tester la logique d'envoi
- ✅ Vérifier les notifications
- ✅ Développer l'interface admin
- ✅ Valider le workflow complet