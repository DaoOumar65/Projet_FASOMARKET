# 🔧 FIX URGENT - Nom de Boutique Manquant

## 🚨 Problème Identifié

L'endpoint `/api/public/boutiques` ne retourne pas le **nom de la boutique**, ce qui cause des erreurs d'affichage dans le frontend.

## 📋 Solution Backend

### 1. Modifier le Controller BoutiqueController

```java
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicBoutiqueController {

    @Autowired
    private BoutiqueService boutiqueService;

    @GetMapping("/boutiques")
    public ResponseEntity<List<BoutiquePublicDTO>> getBoutiquesActives() {
        List<BoutiquePublicDTO> boutiques = boutiqueService.getBoutiquesActives();
        return ResponseEntity.ok(boutiques);
    }
}
```

### 2. Créer/Modifier le DTO BoutiquePublicDTO

```java
public class BoutiquePublicDTO {
    private Long id;
    private String nom;           // ⚠️ CHAMP MANQUANT
    private String description;
    private String adresse;
    private String telephone;
    private String email;
    private String logo;
    private String statut;
    private String categorieId;
    private String categorieName;
    private LocalDateTime dateCreation;

    // Constructeurs
    public BoutiquePublicDTO() {}

    public BoutiquePublicDTO(Long id, String nom, String description, String adresse, 
                           String telephone, String email, String logo, String statut,
                           String categorieId, String categorieName, LocalDateTime dateCreation) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.adresse = adresse;
        this.telephone = telephone;
        this.email = email;
        this.logo = logo;
        this.statut = statut;
        this.categorieId = categorieId;
        this.categorieName = categorieName;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getCategorieId() { return categorieId; }
    public void setCategorieId(String categorieId) { this.categorieId = categorieId; }

    public String getCategorieName() { return categorieName; }
    public void setCategorieName(String categorieName) { this.categorieName = categorieName; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}
```

### 3. Modifier le Service BoutiqueService

```java
@Service
public class BoutiqueService {

    @Autowired
    private BoutiqueRepository boutiqueRepository;

    public List<BoutiquePublicDTO> getBoutiquesActives() {
        List<Boutique> boutiques = boutiqueRepository.findByStatut("ACTIVE");
        
        return boutiques.stream()
            .map(this::convertToBoutiquePublicDTO)
            .collect(Collectors.toList());
    }

    private BoutiquePublicDTO convertToBoutiquePublicDTO(Boutique boutique) {
        return new BoutiquePublicDTO(
            boutique.getId(),
            boutique.getNom(),        // ⚠️ AJOUTER CE CHAMP
            boutique.getDescription(),
            boutique.getAdresse(),
            boutique.getTelephone(),
            boutique.getEmail(),
            boutique.getLogo(),
            boutique.getStatut(),
            boutique.getCategorie() != null ? boutique.getCategorie().getId().toString() : null,
            boutique.getCategorie() != null ? boutique.getCategorie().getNom() : null,
            boutique.getDateCreation()
        );
    }
}
```

### 4. Vérifier l'Entité Boutique

```java
@Entity
@Table(name = "boutiques")
public class Boutique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false)
    private String nom;           // ⚠️ VÉRIFIER QUE CE CHAMP EXISTE

    @Column(name = "description")
    private String description;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "logo")
    private String logo;

    @Column(name = "statut")
    private String statut;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @ManyToOne
    @JoinColumn(name = "vendeur_id")
    private Utilisateur vendeur;

    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    
    // ... autres getters/setters
}
```

## 🗄️ Vérification Base de Données

### Vérifier la colonne 'nom' dans la table boutiques:

```sql
-- Vérifier la structure de la table
DESCRIBE boutiques;

-- Si la colonne 'nom' n'existe pas, l'ajouter:
ALTER TABLE boutiques ADD COLUMN nom VARCHAR(255) NOT NULL AFTER id;

-- Mettre à jour les boutiques existantes avec un nom par défaut:
UPDATE boutiques SET nom = CONCAT('Boutique ', id) WHERE nom IS NULL OR nom = '';
```

## 🧪 Test de l'Endpoint

### Requête Test:
```bash
curl -X GET http://localhost:8080/api/public/boutiques
```

### Réponse Attendue:
```json
[
  {
    "id": 1,
    "nom": "MaroShop",
    "description": "Boutique de vêtements traditionnels",
    "adresse": "Ouagadougou, Burkina Faso",
    "telephone": "+226 70 12 34 56",
    "email": "contact@maroshop.bf",
    "logo": null,
    "statut": "ACTIVE",
    "categorieId": "1",
    "categorieName": "Vêtements",
    "dateCreation": "2024-01-15T10:30:00"
  }
]
```

## ✅ Checklist de Vérification

- [ ] Colonne `nom` existe dans la table `boutiques`
- [ ] Champ `nom` présent dans l'entité `Boutique`
- [ ] Champ `nom` inclus dans `BoutiquePublicDTO`
- [ ] Mapping correct dans `convertToBoutiquePublicDTO()`
- [ ] Test endpoint avec Postman/curl
- [ ] Vérification frontend (affichage nom boutique)

## 🚀 Impact Frontend

Une fois corrigé, le frontend affichera correctement:
- Nom des boutiques dans la liste
- Cartes boutiques avec titres
- Recherche par nom de boutique

## ⚠️ Note Importante

Ce fix est **CRITIQUE** car sans le nom de la boutique, l'interface utilisateur est cassée et les boutiques ne peuvent pas être identifiées par les clients.

**Priorité: URGENTE** 🔥