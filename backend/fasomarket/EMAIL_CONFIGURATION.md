# 📧 Configuration Email - FasoMarket

## ✅ Problème Résolu
L'EmailService est maintenant appelé lors de la validation des vendeurs. Les emails apparaîtront dans les logs de la console.

## 📋 Statut Actuel
- ✅ EmailService intégré dans AdminController
- ✅ Emails de simulation affichés dans les logs
- ✅ Notifications créées en base de données

## 🔧 Pour Activer les Vrais Emails (Optionnel)

### 1. Ajouter la Dépendance Email
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 2. Configuration SMTP
```properties
# application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 3. EmailService avec Vrai Envoi
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
                "Félicitations ! Votre compte vendeur a été approuvé par notre équipe.\n" +
                "Vous pouvez maintenant vous connecter et créer vos boutiques.\n\n" +
                "Cordialement,\n" +
                "L'équipe FasoMarket"
            );
            
            mailSender.send(message);
            System.out.println("Email d'approbation envoyé à: " + email);
        } catch (Exception e) {
            System.err.println("Erreur envoi email: " + e.getMessage());
        }
    }
    
    public void envoyerEmailRejetVendeur(String email, String nomComplet, String raison) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Votre demande vendeur FasoMarket");
            message.setText(
                "Bonjour " + nomComplet + ",\n\n" +
                "Nous regrettons de vous informer que votre demande de compte vendeur n'a pas été approuvée.\n" +
                "Raison: " + (raison != null ? raison : "Documents incomplets") + "\n\n" +
                "Vous pouvez soumettre une nouvelle demande avec les documents requis.\n\n" +
                "Cordialement,\n" +
                "L'équipe FasoMarket"
            );
            
            mailSender.send(message);
            System.out.println("Email de rejet envoyé à: " + email);
        } catch (Exception e) {
            System.err.println("Erreur envoi email: " + e.getMessage());
        }
    }
}
```

## 🧪 Test de Fonctionnement

### Logs à Vérifier
Après validation d'un vendeur, vous devriez voir dans les logs :

```
=== EMAIL APPROBATION VENDEUR ===
À: vendeur@example.com
Sujet: Votre compte vendeur FasoMarket a été approuvé
Message:
Bonjour Jean Dupont,
Félicitations ! Votre compte vendeur a été approuvé par notre équipe.
...
=======================================
```

### Test avec cURL
```bash
curl -X PUT "http://localhost:8081/api/admin/vendeurs/aab82296-4455-41d0-aefa-ee05668db803/valider?statut=COMPTE_VALIDE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-Id: YOUR_ADMIN_ID"
```

**Réponse attendue :**
```json
"Vendeur approuvé, notification et email envoyés"
```

## 📱 Alternatives d'Envoi

### 1. Service SMS (Recommandé pour l'Afrique)
```java
@Service
public class SmsService {
    public void envoyerSmsApprobation(String telephone, String nomComplet) {
        // Intégration avec un service SMS local
        System.out.println("SMS envoyé à " + telephone + ": Votre compte vendeur FasoMarket est approuvé!");
    }
}
```

### 2. Notifications Push
```java
@Service
public class PushNotificationService {
    public void envoyerNotificationPush(UUID userId, String message) {
        // Intégration Firebase ou autre service push
    }
}
```

## 🎯 Statut Actuel

✅ **Fonctionnel** - Les emails de simulation s'affichent dans les logs
✅ **Notifications** - Créées en base de données  
✅ **Validation** - Statut mis à jour correctement

Pour l'instant, les emails de simulation dans les logs suffisent pour le développement. Vous pouvez activer les vrais emails plus tard si nécessaire.