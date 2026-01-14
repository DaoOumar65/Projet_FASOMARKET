# 📱 GUIDE - Intégration SMS Réels avec Twilio

## 🎯 Étapes d'intégration

### 1. Créer un compte Twilio
1. Aller sur https://www.twilio.com/try-twilio
2. S'inscrire gratuitement (15$ de crédit gratuit)
3. Vérifier votre numéro de téléphone
4. Obtenir vos credentials:
   - **Account SID**
   - **Auth Token**
   - **Numéro Twilio** (commence par +1...)

### 2. Ajouter la dépendance Maven

Ajouter dans `pom.xml`:
```xml
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.14.1</version>
</dependency>
```

### 3. Configuration dans `application.properties`

```properties
# Twilio Configuration
twilio.account.sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth.token=your_auth_token_here
twilio.phone.number=+1234567890
```

### 4. Mettre à jour `SmsService.java`

```java
package com.example.fasomarket.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    public void envoyerSmsConfirmationCommande(String numeroTelephone, String numeroCommande, Double montant) {
        try {
            // Initialiser Twilio
            Twilio.init(accountSid, authToken);

            // Formater le numéro (ajouter +226 pour Burkina Faso si nécessaire)
            String numeroFormate = formatPhoneNumber(numeroTelephone);

            // Message SMS
            String messageText = String.format(
                "FasoMarket: Votre commande %s d'un montant de %,.0f FCFA a été créée avec succès. Merci!",
                numeroCommande, montant
            );

            // Envoyer le SMS
            Message message = Message.creator(
                new PhoneNumber(numeroFormate),      // Destinataire
                new PhoneNumber(twilioPhoneNumber),  // Expéditeur (votre numéro Twilio)
                messageText                          // Message
            ).create();

            System.out.println("✅ SMS envoyé avec succès! SID: " + message.getSid());

        } catch (Exception e) {
            System.err.println("❌ Erreur envoi SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String formatPhoneNumber(String numero) {
        // Supprimer espaces et tirets
        numero = numero.replaceAll("[\\s-]", "");
        
        // Ajouter +226 si le numéro commence par 0 (Burkina Faso)
        if (numero.startsWith("0")) {
            return "+226" + numero.substring(1);
        }
        
        // Ajouter + si manquant
        if (!numero.startsWith("+")) {
            return "+" + numero;
        }
        
        return numero;
    }
}
```

### 5. Tester l'envoi

Après redémarrage, créer une commande avec:
```json
{
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "numeroTelephone": "70123456"  // Votre vrai numéro
}
```

Le SMS arrivera sur votre téléphone ! 📱

## 🌍 Alternative: Orange SMS API (pour l'Afrique)

Si vous préférez Orange SMS API:

```java
// Configuration Orange
@Value("${orange.sms.client.id}")
private String clientId;

@Value("${orange.sms.client.secret}")
private String clientSecret;

public void envoyerSmsOrange(String numero, String message) {
    // 1. Obtenir token OAuth
    String token = getOrangeToken();
    
    // 2. Envoyer SMS via API Orange
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(token);
    headers.setContentType(MediaType.APPLICATION_JSON);
    
    Map<String, Object> body = new HashMap<>();
    body.put("outboundSMSMessageRequest", Map.of(
        "address", "tel:+226" + numero,
        "senderAddress", "tel:+226XXXXXXXX",
        "outboundSMSTextMessage", Map.of("message", message)
    ));
    
    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
    restTemplate.postForEntity(
        "https://api.orange.com/smsmessaging/v1/outbound/tel:+226XXXXXXXX/requests",
        request,
        String.class
    );
}
```

## 💰 Coûts

- **Twilio**: ~0.0075$ par SMS (~4 FCFA)
- **Orange SMS API**: Variable selon contrat
- **Compte gratuit Twilio**: 15$ de crédit = ~2000 SMS gratuits

## ✅ Résultat

Après intégration, chaque commande déclenchera un vrai SMS sur le téléphone du client ! 🎉
