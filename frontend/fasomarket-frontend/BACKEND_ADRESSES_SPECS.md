# BACKEND - Gestion des Adresses avec Géolocalisation

## 1. Modèle de données (Entity)

```java
@Entity
@Table(name = "adresses")
public class Adresse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String adresseComplete;
    
    private String ville;
    private String secteur;
    private String quartier;
    private String rue;
    private String codePostal;
    
    // Coordonnées GPS
    @Column(precision = 10, scale = 8)
    private Double latitude;
    
    @Column(precision = 11, scale = 8)
    private Double longitude;
    
    // Métadonnées
    private String pays = "Burkina Faso";
    private Boolean estVerifiee = false;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    
    // Relations
    @OneToMany(mappedBy = "adresse")
    private List<Boutique> boutiques;
    
    @OneToMany(mappedBy = "adresseLivraison")
    private List<Commande> commandes;
    
    // Constructeurs, getters, setters...
}
```

## 2. Service de géocodage

```java
@Service
public class GeocodingService {
    
    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;
    
    private final RestTemplate restTemplate;
    
    public GeocodingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public Coordonnees geocodeAdresse(String adresse) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s",
                URLEncoder.encode(adresse + ", Burkina Faso", StandardCharsets.UTF_8),
                googleMapsApiKey
            );
            
            GoogleGeocodingResponse response = restTemplate.getForObject(url, GoogleGeocodingResponse.class);
            
            if (response != null && "OK".equals(response.getStatus()) && !response.getResults().isEmpty()) {
                GoogleGeocodingResult result = response.getResults().get(0);
                return new Coordonnees(
                    result.getGeometry().getLocation().getLat(),
                    result.getGeometry().getLocation().getLng()
                );
            }
            
            return null;
        } catch (Exception e) {
            log.error("Erreur lors du géocodage de l'adresse: {}", adresse, e);
            return null;
        }
    }
    
    public void geocoderAdresses(List<Adresse> adresses) {
        for (Adresse adresse : adresses) {
            if (adresse.getLatitude() == null || adresse.getLongitude() == null) {
                Coordonnees coords = geocodeAdresse(adresse.getAdresseComplete());
                if (coords != null) {
                    adresse.setLatitude(coords.getLatitude());
                    adresse.setLongitude(coords.getLongitude());
                    adresse.setEstVerifiee(true);
                }
                
                // Délai pour respecter les limites de l'API
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
}
```

## 3. Controller REST

```java
@RestController
@RequestMapping("/api/adresses")
public class AdresseController {
    
    private final AdresseService adresseService;
    private final GeocodingService geocodingService;
    
    @PostMapping("/geocoder")
    public ResponseEntity<AdresseResponse> geocoderAdresse(@RequestBody AdresseRequest request) {
        try {
            Coordonnees coords = geocodingService.geocodeAdresse(request.getAdresse());
            
            if (coords != null) {
                Adresse adresse = new Adresse();
                adresse.setAdresseComplete(request.getAdresse());
                adresse.setLatitude(coords.getLatitude());
                adresse.setLongitude(coords.getLongitude());
                adresse.setEstVerifiee(true);
                
                Adresse savedAdresse = adresseService.save(adresse);
                
                return ResponseEntity.ok(AdresseResponse.fromEntity(savedAdresse));
            }
            
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/boutique/{boutiqueId}")
    public ResponseEntity<AdresseResponse> getAdresseBoutique(@PathVariable String boutiqueId) {
        Optional<Boutique> boutique = boutiqueService.findById(boutiqueId);
        
        if (boutique.isPresent() && boutique.get().getAdresse() != null) {
            return ResponseEntity.ok(AdresseResponse.fromEntity(boutique.get().getAdresse()));
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/batch-geocode")
    public ResponseEntity<List<AdresseResponse>> geocoderPlusieursAdresses(@RequestBody List<String> adresses) {
        List<Adresse> adressesEntities = adresses.stream()
            .map(addr -> {
                Adresse adresse = new Adresse();
                adresse.setAdresseComplete(addr);
                return adresse;
            })
            .collect(Collectors.toList());
        
        geocodingService.geocoderAdresses(adressesEntities);
        
        List<Adresse> savedAdresses = adresseService.saveAll(adressesEntities);
        
        return ResponseEntity.ok(
            savedAdresses.stream()
                .map(AdresseResponse::fromEntity)
                .collect(Collectors.toList())
        );
    }
}
```

## 4. DTOs

```java
public class AdresseRequest {
    private String adresse;
    private String ville;
    private String secteur;
    // getters, setters...
}

public class AdresseResponse {
    private String id;
    private String adresseComplete;
    private Double latitude;
    private Double longitude;
    private Boolean estVerifiee;
    
    public static AdresseResponse fromEntity(Adresse adresse) {
        AdresseResponse response = new AdresseResponse();
        response.setId(adresse.getId());
        response.setAdresseComplete(adresse.getAdresseComplete());
        response.setLatitude(adresse.getLatitude());
        response.setLongitude(adresse.getLongitude());
        response.setEstVerifiee(adresse.getEstVerifiee());
        return response;
    }
}

public class Coordonnees {
    private Double latitude;
    private Double longitude;
    
    // constructeurs, getters, setters...
}
```

## 5. Configuration

```properties
# application.properties
google.maps.api.key=your_google_maps_api_key_here

# Configuration de la base de données pour les coordonnées
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

## 6. Migration de base de données

```sql
-- Migration pour ajouter les colonnes de géolocalisation
ALTER TABLE boutiques ADD COLUMN adresse_id VARCHAR(36);
ALTER TABLE commandes ADD COLUMN adresse_livraison_id VARCHAR(36);

-- Créer la table des adresses
CREATE TABLE adresses (
    id VARCHAR(36) PRIMARY KEY,
    adresse_complete VARCHAR(500) NOT NULL,
    ville VARCHAR(100),
    secteur VARCHAR(100),
    quartier VARCHAR(100),
    rue VARCHAR(200),
    code_postal VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    pays VARCHAR(100) DEFAULT 'Burkina Faso',
    est_verifiee BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour les recherches géographiques
CREATE INDEX idx_adresses_coords ON adresses(latitude, longitude);
CREATE INDEX idx_adresses_ville ON adresses(ville);

-- Contraintes de clés étrangères
ALTER TABLE boutiques ADD CONSTRAINT fk_boutique_adresse 
    FOREIGN KEY (adresse_id) REFERENCES adresses(id);
    
ALTER TABLE commandes ADD CONSTRAINT fk_commande_adresse_livraison 
    FOREIGN KEY (adresse_livraison_id) REFERENCES adresses(id);
```

## 7. Endpoints API

- `POST /api/adresses/geocoder` - Géocoder une adresse
- `GET /api/adresses/boutique/{id}` - Obtenir l'adresse d'une boutique
- `POST /api/adresses/batch-geocode` - Géocoder plusieurs adresses
- `GET /api/adresses/{id}` - Obtenir une adresse par ID
- `PUT /api/adresses/{id}` - Mettre à jour une adresse
- `DELETE /api/adresses/{id}` - Supprimer une adresse