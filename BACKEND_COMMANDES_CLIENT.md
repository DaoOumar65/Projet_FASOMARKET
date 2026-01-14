# 🚨 BACKEND - Endpoints Commandes Client à implémenter

## 📋 Endpoints requis

### 0. **DELETE /api/client/panier/vider** ⚠️ URGENT
Vider le panier du client (appelé après création de commande)

**Headers requis :**
```
X-User-Id: {clientId}
Authorization: Bearer {token}
```

**Réponse attendue :**
```json
{
  "message": "Panier vidé avec succès"
}
```

### 1. **GET /api/client/commandes**
Récupérer l'historique des commandes du client connecté

**Headers requis :**
```
X-User-Id: {clientId}
Authorization: Bearer {token}
```

**Réponse attendue :**
```json
[
  {
    "id": 1,
    "numeroCommande": "CMD001",
    "statut": "LIVREE",
    "total": 45000,
    "dateCreation": "2024-01-15T10:30:00Z",
    "nombreArticles": 3,
    "adresseLivraison": "Secteur 15, Ouagadougou",
    "methodePaiement": "MOBILE_MONEY"
  }
]
```

### 2. **GET /api/client/commandes/{id}**
Récupérer les détails d'une commande spécifique

**Réponse attendue :**
```json
{
  "id": 1,
  "numeroCommande": "CMD001",
  "statut": "LIVREE",
  "total": 45000,
  "dateCreation": "2024-01-15T10:30:00Z",
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "methodePaiement": "MOBILE_MONEY",
  "items": [
    {
      "id": 1,
      "produitNom": "Chemise Traditionnelle",
      "produitImage": "image1.jpg",
      "quantite": 3,
      "prixUnitaire": 15000,
      "boutique": "Boutique Traditionnelle"
    }
  ],
  "historique": [
    {
      "statut": "EN_ATTENTE",
      "date": "2024-01-15T10:30:00Z",
      "description": "Commande reçue"
    },
    {
      "statut": "LIVREE",
      "date": "2024-01-17T14:00:00Z",
      "description": "Commande livrée avec succès"
    }
  ]
}
```

### 3. **POST /api/client/commandes/creer**
Créer une nouvelle commande à partir du panier

**Body requis :**
```json
{
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "methodePaiement": "MOBILE_MONEY",
  "numeroTelephone": "70123456",
  "instructions": "Sonner à la porte principale"
}
```

**Réponse attendue :**
```json
{
  "id": 1,
  "numeroCommande": "CMD001",
  "statut": "EN_ATTENTE",
  "total": 45000,
  "message": "Commande créée avec succès"
}
```

## 🗂️ Modèles de données

### **Commande Entity**
```java
@Entity
public class Commande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String numeroCommande;
    
    @Enumerated(EnumType.STRING)
    private StatutCommande statut;
    
    private Double total;
    
    @CreationTimestamp
    private LocalDateTime dateCreation;
    
    private String adresseLivraison;
    
    @Enumerated(EnumType.STRING)
    private MethodePaiement methodePaiement;
    
    private String numeroTelephone;
    private String instructions;
    
    @ManyToOne
    private User client;
    
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL)
    private List<CommandeItem> items;
    
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL)
    private List<CommandeHistorique> historique;
}
```

### **CommandeItem Entity**
```java
@Entity
public class CommandeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Commande commande;
    
    @ManyToOne
    private Produit produit;
    
    private Integer quantite;
    private Double prixUnitaire;
}
```

### **CommandeHistorique Entity**
```java
@Entity
public class CommandeHistorique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Commande commande;
    
    @Enumerated(EnumType.STRING)
    private StatutCommande statut;
    
    @CreationTimestamp
    private LocalDateTime date;
    
    private String description;
}
```

### **Enums**
```java
public enum StatutCommande {
    EN_ATTENTE,
    CONFIRMEE,
    PREPAREE,
    EXPEDIEE,
    LIVREE,
    ANNULEE
}

public enum MethodePaiement {
    MOBILE_MONEY,
    PAIEMENT_LIVRAISON
}
```

## 🎯 Controller à implémenter

```java
@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")
public class ClientCommandeController {

    @Autowired
    private CommandeService commandeService;
    
    @Autowired
    private PanierService panierService;

    @DeleteMapping("/panier/vider")
    public ResponseEntity<Map<String, String>> viderPanier(@RequestHeader("X-User-Id") String clientId) {
        panierService.viderPanier(clientId);
        return ResponseEntity.ok(Map.of("message", "Panier vidé avec succès"));
    }

    @GetMapping("/commandes")
    public ResponseEntity<List<CommandeDTO>> getCommandes(@RequestHeader("X-User-Id") String clientId) {
        List<CommandeDTO> commandes = commandeService.getCommandesByClient(clientId);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/commandes/{id}")
    public ResponseEntity<CommandeDetailDTO> getCommande(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String clientId) {
        CommandeDetailDTO commande = commandeService.getCommandeDetail(id, clientId);
        return ResponseEntity.ok(commande);
    }

    @PostMapping("/commandes/creer")
    public ResponseEntity<CommandeCreationResponse> creerCommande(
            @RequestBody CommandeCreationRequest request,
            @RequestHeader("X-User-Id") String clientId) {
        CommandeCreationResponse response = commandeService.creerCommande(request, clientId);
        return ResponseEntity.ok(response);
    }
}
```

## ✅ Logique métier

1. **Création de commande :**
   - Récupérer le panier du client
   - Créer la commande avec statut EN_ATTENTE
   - Générer un numéro de commande unique
   - Créer les items de commande
   - Vider le panier
   - Créer l'historique initial

2. **Génération numéro commande :**
   ```java
   private String genererNumeroCommande() {
       return "CMD" + System.currentTimeMillis();
   }
   ```

3. **Sécurité :**
   - Vérifier que le client ne peut voir que ses propres commandes
   - Valider les données d'entrée
   - Gérer les erreurs appropriées

**Les endpoints sont attendus par le frontend pour afficher l'historique des commandes !** 🎉