# Guide de Création des Catégories - FasoMarket

## 1. Comment les catégories sont créées

### Interface Admin (Recommandé)
Les catégories sont créées via l'interface d'administration :

**Accès :** `/admin/parametres` (Admin seulement)

**Processus :**
1. Connexion avec un compte admin
2. Navigation vers "Paramètres système"
3. Section "Gestion des catégories"
4. Bouton "Ajouter catégorie"
5. Remplir le formulaire :
   - **Nom** : Ex: "Électronique", "Vêtements", "Alimentation"
   - **Description** : Description détaillée de la catégorie
   - **Icône** : Emoji représentant la catégorie (📱, 👕, 🍎)

### API Backend
**Endpoint :** `POST /api/admin/categories/creer`

**Payload :**
```json
{
  "nom": "Électronique",
  "description": "Appareils électroniques et accessoires",
  "icone": "📱"
}
```

## 2. Structure Backend des Catégories

### Entité Categorie
```java
@Entity
@Table(name = "categories")
public class Categorie {
    @Id
    private String id;
    
    @Column(nullable = false, unique = true)
    private String nom;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String icone;
    
    @Column(nullable = false)
    private LocalDateTime dateCreation;
    
    private Boolean active = true;
    
    // Relations
    @OneToMany(mappedBy = "categorie")
    private List<Produit> produits;
    
    // Getters, setters...
}
```

### Service de Gestion
```java
@Service
public class CategorieService {
    
    private final CategorieRepository categorieRepository;
    
    public CategorieResponse creerCategorie(CreerCategorieRequest request) {
        // Vérifier l'unicité du nom
        if (categorieRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà");
        }
        
        Categorie categorie = new Categorie();
        categorie.setId(UUID.randomUUID().toString());
        categorie.setNom(request.getNom());
        categorie.setDescription(request.getDescription());
        categorie.setIcone(request.getIcone());
        categorie.setDateCreation(LocalDateTime.now());
        
        categorie = categorieRepository.save(categorie);
        return CategorieResponse.fromEntity(categorie);
    }
    
    public List<CategorieResponse> getCategories() {
        return categorieRepository.findAllByActiveTrue()
            .stream()
            .map(CategorieResponse::fromEntity)
            .collect(Collectors.toList());
    }
}
```

## 3. Frontend - Interface de Création

### Page AdminParametres.tsx
**Fonctionnalités :**
- ✅ Formulaire de création avec validation
- ✅ Liste des catégories existantes
- ✅ Modification en ligne
- ✅ Suppression avec confirmation
- ✅ Compteur de produits par catégorie

**Champs du formulaire :**
```typescript
interface FormData {
  nom: string;        // Nom de la catégorie
  description: string; // Description détaillée
  icone: string;      // Emoji ou icône
}
```

### Validation Frontend
```typescript
const handleSubmitCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation des champs requis
  if (!formData.nom || !formData.description || !formData.icone) {
    toast.error('Tous les champs sont requis');
    return;
  }
  
  // Appel API
  if (editingCategory) {
    await adminService.updateCategorie(editingCategory.id, formData);
  } else {
    await adminService.creerCategorie(formData);
  }
};
```

## 4. Catégories Prédéfinies Recommandées

### Catégories E-commerce Standard
```json
[
  {
    "nom": "Électronique",
    "description": "Smartphones, ordinateurs, accessoires électroniques",
    "icone": "📱"
  },
  {
    "nom": "Vêtements",
    "description": "Vêtements pour hommes, femmes et enfants",
    "icone": "👕"
  },
  {
    "nom": "Alimentation",
    "description": "Produits alimentaires, boissons, épices",
    "icone": "🍎"
  },
  {
    "nom": "Maison & Jardin",
    "description": "Meubles, décoration, outils de jardinage",
    "icone": "🏠"
  },
  {
    "nom": "Beauté & Santé",
    "description": "Cosmétiques, produits de soins, médicaments",
    "icone": "💄"
  },
  {
    "nom": "Sport & Loisirs",
    "description": "Équipements sportifs, jeux, loisirs",
    "icone": "⚽"
  },
  {
    "nom": "Automobile",
    "description": "Pièces auto, accessoires, entretien",
    "icone": "🚗"
  },
  {
    "nom": "Artisanat",
    "description": "Produits artisanaux locaux, art traditionnel",
    "icone": "🎨"
  }
]
```

## 5. Utilisation des Catégories

### Dans les Produits
Les vendeurs sélectionnent une catégorie lors de la création de produits :

```typescript
// Page AjouterProduit.tsx
const [categories, setCategories] = useState<Categorie[]>([]);

useEffect(() => {
  // Charger les catégories disponibles
  publicService.getCategories().then(response => {
    setCategories(response.data);
  });
}, []);

// Sélection dans le formulaire
<select 
  value={formData.categorie}
  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
>
  <option value="">Sélectionner une catégorie</option>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>
      {cat.icone} {cat.nom}
    </option>
  ))}
</select>
```

### Navigation par Catégorie
```typescript
// Page Categories.tsx - Navigation publique
const categories = await publicService.getCategories();

// Affichage en grille
{categories.map(category => (
  <Link to={`/categories/${category.id}/produits`}>
    <div className="category-card">
      <span className="icon">{category.icone}</span>
      <h3>{category.nom}</h3>
      <p>{category.description}</p>
    </div>
  </Link>
))}
```

## 6. Endpoints API Complets

### Admin (Gestion)
- `POST /api/admin/categories/creer` - Créer une catégorie
- `GET /api/admin/categories` - Liste admin avec stats
- `PUT /api/admin/categories/{id}` - Modifier une catégorie
- `DELETE /api/admin/categories/{id}` - Supprimer une catégorie

### Public (Consultation)
- `GET /api/public/categories` - Liste publique des catégories
- `GET /api/public/categories/{id}/produits` - Produits d'une catégorie
- `GET /api/public/categories/{id}/vitrine` - Vitrine d'une catégorie

### Vendeur (Utilisation)
- `GET /api/vendeur/categories/{id}/form-fields` - Champs spécifiques à la catégorie

## 7. Bonnes Pratiques

### Nommage des Catégories
- **Noms courts et clairs** : "Électronique" plutôt que "Appareils électroniques et gadgets"
- **Pas de doublons** : Vérification d'unicité côté backend
- **Cohérence** : Utiliser la même convention de nommage

### Icônes
- **Emojis recommandés** : Plus universels et colorés
- **Cohérence visuelle** : Style similaire pour toutes les icônes
- **Lisibilité** : Icônes facilement reconnaissables

### Organisation
- **Hiérarchie logique** : Catégories principales puis sous-catégories si nécessaire
- **Éviter la sur-segmentation** : Pas trop de catégories pour éviter la confusion
- **Maintenance régulière** : Supprimer les catégories inutilisées

## 8. Migration et Données Initiales

### Script de Migration
```sql
-- Créer la table des catégories
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icone VARCHAR(10) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- Insérer les catégories de base
INSERT INTO categories (id, nom, description, icone) VALUES
(UUID(), 'Électronique', 'Smartphones, ordinateurs, accessoires électroniques', '📱'),
(UUID(), 'Vêtements', 'Vêtements pour hommes, femmes et enfants', '👕'),
(UUID(), 'Alimentation', 'Produits alimentaires, boissons, épices', '🍎'),
(UUID(), 'Maison & Jardin', 'Meubles, décoration, outils de jardinage', '🏠'),
(UUID(), 'Beauté & Santé', 'Cosmétiques, produits de soins, médicaments', '💄'),
(UUID(), 'Sport & Loisirs', 'Équipements sportifs, jeux, loisirs', '⚽'),
(UUID(), 'Automobile', 'Pièces auto, accessoires, entretien', '🚗'),
(UUID(), 'Artisanat', 'Produits artisanaux locaux, art traditionnel', '🎨');
```

Les catégories sont donc créées principalement par les **administrateurs** via l'interface web, avec possibilité d'initialisation par script SQL pour les catégories de base.