package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.*;
import com.example.fasomarket.repository.*;
import com.example.fasomarket.model.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendeur")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@Tag(name = "Interface Vendeur", description = "API pour le dashboard vendeur")
public class VendeurController {

    @Autowired
    private ShopService shopService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard vendeur", description = "Données du tableau de bord vendeur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dashboard récupéré"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> obtenirDashboardVendeur(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Statistiques
            Map<String, Object> stats = new HashMap<>();
            var commandes = orderService.obtenirCommandesVendeur(vendorId);
            long nouvellesCommandes = commandes.stream().filter(c -> c.getStatut().equals("EN_ATTENTE")).count();
            double ventesAujourdhui = commandes.stream()
                .filter(c -> c.getDateCreation().toLocalDate().equals(java.time.LocalDate.now()))
                .mapToDouble(c -> c.getMontantTotal().doubleValue())
                .sum();
            var produits = productService.obtenirMesProduits(vendorId);
            int produitsEnStock = produits.stream().mapToInt(p -> p.getQuantiteStock()).sum();
            
            stats.put("nouvellesCommandes", (int) nouvellesCommandes);
            stats.put("ventesAujourdhui", (int) ventesAujourdhui);
            stats.put("produitsEnStock", produitsEnStock);
            stats.put("notificationsNonLues", (int) notificationService.compterNotificationsNonLues(vendorId));
            response.put("statistiques", stats);
            
            // Ma boutique
            try {
                BoutiqueResponse boutique = shopService.obtenirBoutiqueVendeur(vendorId);
                response.put("boutique", boutique);
            } catch (RuntimeException e) {
                response.put("boutique", null); // Pas encore de boutique
            }
            
            // Commandes récentes
            response.put("commandesRecentes", commandes.subList(0, Math.min(5, commandes.size())));
            
            // Produits récents
            response.put("produitsRecents", produits.subList(0, Math.min(5, produits.size())));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement du dashboard");
        }
    }

    @GetMapping("/analytics")
    @Operation(summary = "Analytics vendeur", description = "Statistiques détaillées des ventes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics récupérées")
    })
    public ResponseEntity<?> obtenirAnalyticsVendeur(
            @RequestHeader("X-User-Id") UUID vendorId,
            @RequestParam(required = false) String periode) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            var commandes = orderService.obtenirCommandesVendeur(vendorId);
            var produits = productService.obtenirMesProduits(vendorId);
            
            // Ventes par mois (simulation)
            List<Map<String, Object>> ventesParMois = new ArrayList<>();
            for (int i = 1; i <= 12; i++) {
                Map<String, Object> mois = new HashMap<>();
                mois.put("mois", i);
                mois.put("ventes", (int)(Math.random() * 50));
                mois.put("chiffreAffaires", (int)(Math.random() * 100000));
                ventesParMois.add(mois);
            }
            response.put("ventesParMois", ventesParMois);
            
            // Produits populaires
            List<Map<String, Object>> produitsPopulaires = produits.stream()
                .limit(5)
                .map(p -> {
                    Map<String, Object> produit = new HashMap<>();
                    produit.put("nom", p.getNom());
                    produit.put("quantiteVendue", (int)(Math.random() * 100));
                    produit.put("chiffreAffaires", p.getPrix().multiply(new java.math.BigDecimal(Math.random() * 50)).intValue());
                    return produit;
                })
                .collect(Collectors.toList());
            response.put("produitsPopulaires", produitsPopulaires);
            
            // Statistiques générales
            Map<String, Object> statsGenerales = new HashMap<>();
            double chiffreAffairesTotal = commandes.stream()
                .mapToDouble(c -> c.getMontantTotal().doubleValue())
                .sum();
            statsGenerales.put("chiffreAffairesTotal", (int) chiffreAffairesTotal);
            statsGenerales.put("chiffreAffairesMois", (int)(chiffreAffairesTotal * 0.3));
            statsGenerales.put("nombreVentesTotales", commandes.size());
            statsGenerales.put("panierMoyen", commandes.isEmpty() ? 0 : (int)(chiffreAffairesTotal / commandes.size()));
            statsGenerales.put("tauxConversion", 15.5);
            statsGenerales.put("nombreProduitsActifs", produits.size());
            response.put("statistiquesGenerales", statsGenerales);
            
            // Evolution des ventes
            Map<String, Object> evolution = new HashMap<>();
            evolution.put("pourcentageVentes", 12.5);
            evolution.put("pourcentageCA", 18.3);
            evolution.put("tendanceVentes", "hausse");
            evolution.put("tendanceCA", "hausse");
            response.put("evolutionVentes", evolution);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des analytics");
        }
    }

    @GetMapping("/gestion-stock")
    @Operation(summary = "Gestion du stock", description = "Vue d'ensemble du stock des produits")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock récupéré")
    })
    public ResponseEntity<?> obtenirGestionStock(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            var produits = productService.obtenirMesProduits(vendorId);
            
            // Convertir en StockDTO
            List<StockDTO> stocks = produits.stream()
                .map(this::convertToStockDTO)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("produits", stocks);
            response.put("produitsEnRupture", stocks.stream()
                    .filter(p -> p.getStockQuantity() <= 0)
                    .toList());
            response.put("produitsStockFaible", stocks.stream()
                    .filter(p -> p.getStockQuantity() > 0 && p.getStockQuantity() <= 5)
                    .toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement du stock");
        }
    }
    
    private StockDTO convertToStockDTO(ProduitResponse produit) {
        StockDTO dto = new StockDTO();
        dto.setId(produit.getId());
        dto.setName(produit.getNom());
        dto.setPrice(produit.getPrix());
        dto.setStockQuantity(produit.getQuantiteStock());
        dto.setAlertThreshold(5); // Seuil par défaut
        dto.setImages(produit.getImages());
        dto.setAvailable(produit.getDisponible());
        dto.setStatut(produit.getActif() != null && produit.getActif() ? "ACTIVE" : "INACTIVE");
        dto.setUpdatedAt(produit.getDateModification());
        dto.setCategory(produit.getCategorie());
        dto.setSalesCount(0); // À implémenter si nécessaire
        return dto;
    }

    @PutMapping("/produits/{produitId}/stock")
    @Operation(summary = "Mettre à jour stock", description = "Modifie la quantité en stock d'un produit")
    public ResponseEntity<?> mettreAJourStock(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID produitId,
            @RequestBody Map<String, Object> request) {
        try {
            Integer quantiteStock = (Integer) request.get("quantiteStock");
            if (quantiteStock == null) {
                return ResponseEntity.badRequest().body("quantiteStock est requis");
            }
            
            ProduitResponse response = productService.modifierProduit(vendorId, produitId, 
                ModifierProduitRequest.builder().quantiteStock(quantiteStock).build());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/boutiques/livraison")
    @Operation(summary = "Configurer livraison", description = "Configure les paramètres de livraison")
    public ResponseEntity<?> configurerLivraison(
            @RequestHeader("X-User-Id") UUID vendorId,
            @RequestParam Boolean livraisonActive,
            @RequestParam(required = false) Double fraisLivraison) {
        try {
            ModifierBoutiqueRequest request = ModifierBoutiqueRequest.builder()
                .livraison(livraisonActive)
                .fraisLivraison(fraisLivraison != null ? java.math.BigDecimal.valueOf(fraisLivraison) : null)
                .build();
            
            BoutiqueResponse boutique = shopService.obtenirBoutiqueVendeur(vendorId);
            BoutiqueResponse response = shopService.modifierBoutique(vendorId, boutique.getId(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === STATUT COMPTE ===
    @GetMapping("/statut-compte")
    @Operation(summary = "Statut du compte vendeur", description = "Récupère le statut de validation du compte")
    public ResponseEntity<?> obtenirStatutCompte(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            User user = userRepository.findById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Profil vendeur non trouvé"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("statutCompte", vendor.getStatus());
            response.put("dateValidation", vendor.getDateValidationCompte());
            response.put("raisonRefus", vendor.getRaisonRefus());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === GESTION BOUTIQUES ===
    @PostMapping("/boutiques/creer")
    @Operation(summary = "Créer boutique", description = "Crée une nouvelle boutique en brouillon")
    public ResponseEntity<?> creerBoutique(
            @RequestHeader("X-User-Id") UUID vendorId,
            @Valid @RequestBody CreerBoutiqueRequest request) {
        try {
            BoutiqueResponse response = shopService.creerBoutique(vendorId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/boutiques/{boutiqueId}/soumettre")
    @Operation(summary = "Soumettre boutique", description = "Soumet la boutique pour validation admin")
    public ResponseEntity<?> soumettreBoutique(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID boutiqueId) {
        try {
            BoutiqueResponse response = shopService.soumettreBoutique(vendorId, boutiqueId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/boutiques/statut")
    @Operation(summary = "Statut boutique", description = "Récupère le statut de validation de la boutique")
    public ResponseEntity<?> obtenirStatutBoutique(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            BoutiqueResponse boutique = shopService.obtenirBoutiqueVendeur(vendorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("statut", boutique.getStatut());
            response.put("dateSoumission", boutique.getDateModification());
            response.put("raisonRejet", null);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/boutiques")
    @Operation(summary = "Ma boutique", description = "Boutique du vendeur")
    public ResponseEntity<?> obtenirMaBoutique(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            BoutiqueResponse boutique = shopService.obtenirBoutiqueVendeur(vendorId);
            if (boutique == null) {
                // Pas encore de boutique créée
                Map<String, Object> response = new HashMap<>();
                response.put("boutique", null);
                response.put("message", "Aucune boutique créée. Créez votre première boutique pour commencer à vendre.");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(boutique);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/boutiques/{boutiqueId}")
    @Operation(summary = "Modifier boutique", description = "Modifie une boutique")
    public ResponseEntity<?> modifierBoutique(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID boutiqueId,
            @Valid @RequestBody ModifierBoutiqueRequest request) {
        try {
            BoutiqueResponse response = shopService.modifierBoutique(vendorId, boutiqueId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === GESTION PRODUITS ===
    @PostMapping("/produits/creer")
    @Operation(summary = "Créer produit", description = "Crée un nouveau produit")
    public ResponseEntity<?> creerProduit(
            @RequestHeader("X-User-Id") UUID vendorId,
            @Valid @RequestBody CreerProduitRequest request) {
        try {
            ProduitResponse response = productService.creerProduit(vendorId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/produits")
    @Operation(summary = "Mes produits", description = "Liste des produits du vendeur")
    public ResponseEntity<?> obtenirMesProduits(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            return ResponseEntity.ok(productService.obtenirMesProduits(vendorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/produits/{produitId}")
    @Operation(summary = "Détails produit", description = "Récupère un produit spécifique")
    public ResponseEntity<?> obtenirProduit(
            @RequestHeader(value = "X-User-Id", required = false) UUID vendorId,
            @PathVariable UUID produitId) {
        try {
            if (vendorId == null) {
                return ResponseEntity.badRequest().body("X-User-Id requis");
            }
            ProduitResponse produit = productService.obtenirProduit(vendorId, produitId);
            return ResponseEntity.ok(produit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/produits/{produitId}")
    @Operation(summary = "Modifier produit", description = "Modifie un produit")
    public ResponseEntity<?> modifierProduit(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID produitId,
            @Valid @RequestBody ModifierProduitRequest request) {
        try {
            ProduitResponse response = productService.modifierProduit(vendorId, produitId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/produits/{produitId}")
    @Operation(summary = "Supprimer produit", description = "Supprime un produit")
    public ResponseEntity<?> supprimerProduit(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID produitId) {
        try {
            productService.supprimerProduit(vendorId, produitId);
            return ResponseEntity.ok("Produit supprimé");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === GESTION COMMANDES ===
    @GetMapping("/commandes")
    @Operation(summary = "Mes commandes", description = "Commandes contenant mes produits")
    public ResponseEntity<?> obtenirMesCommandes(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            return ResponseEntity.ok(orderService.obtenirCommandesVendeur(vendorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/commandes/{commandeId}/statut")
    @Operation(summary = "Changer statut commande", description = "Change le statut d'une commande")
    public ResponseEntity<?> changerStatutCommande(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID commandeId,
            @RequestParam OrderStatus statut) {
        try {
            CommandeResponse response = orderService.changerStatutCommandeVendeur(vendorId, commandeId, statut);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/commandes/{commandeId}/confirmer")
    @Operation(summary = "Confirmer commande", description = "Confirme une commande et prépare la livraison si nécessaire")
    public ResponseEntity<?> confirmerCommande(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID commandeId) {
        try {
            CommandeResponse response = orderService.changerStatutCommandeVendeur(vendorId, commandeId, OrderStatus.CONFIRMED);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/commandes/{commandeId}/expedier")
    @Operation(summary = "Expédier commande", description = "Marque la commande comme expédiée pour livraison")
    public ResponseEntity<?> expedierCommande(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID commandeId) {
        try {
            CommandeResponse response = orderService.changerStatutCommandeVendeur(vendorId, commandeId, OrderStatus.SHIPPED);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/commandes/{commandeId}/livrer")
    @Operation(summary = "Livrer commande", description = "Marque la commande comme livrée")
    public ResponseEntity<?> livrerCommande(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID commandeId) {
        try {
            CommandeResponse response = orderService.changerStatutCommandeVendeur(vendorId, commandeId, OrderStatus.DELIVERED);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === RECHERCHE ===
    @GetMapping("/boutiques/rechercher")
    @Operation(summary = "Rechercher boutique", description = "Recherche dans ma boutique")
    public ResponseEntity<?> rechercherMaBoutique(
            @RequestHeader("X-User-Id") UUID vendorId,
            @RequestParam String query) {
        try {
            BoutiqueResponse boutique = shopService.obtenirBoutiqueVendeur(vendorId);
            if (boutique.getNom().toLowerCase().contains(query.toLowerCase())) {
                return ResponseEntity.ok(List.of(boutique));
            }
            return ResponseEntity.ok(List.of());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/produits/rechercher")
    @Operation(summary = "Rechercher produits", description = "Recherche dans mes produits")
    public ResponseEntity<?> rechercherMesProduits(
            @RequestHeader("X-User-Id") UUID vendorId,
            @RequestParam String query) {
        try {
            var produits = productService.obtenirMesProduits(vendorId);
            var produitsFiltrés = produits.stream()
                    .filter(p -> p.getNom().toLowerCase().contains(query.toLowerCase()))
                    .toList();
            return ResponseEntity.ok(produitsFiltrés);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === NOTIFICATIONS ===
    @GetMapping("/notifications")
    @Operation(summary = "Mes notifications", description = "Notifications du vendeur")
    public ResponseEntity<?> obtenirMesNotifications(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            return ResponseEntity.ok(notificationService.obtenirNotifications(vendorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/notifications/compteur")
    @Operation(summary = "Compteur notifications", description = "Nombre de notifications non lues")
    public ResponseEntity<?> obtenirCompteurNotifications(@RequestHeader("X-User-Id") UUID vendorId) {
        try {
            long count = notificationService.compterNotificationsNonLues(vendorId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("hasUnread", count > 0);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/notifications/{notificationId}/lue")
    @Operation(summary = "Marquer notification lue", description = "Marque une notification comme lue")
    public ResponseEntity<?> marquerNotificationLue(
            @RequestHeader("X-User-Id") UUID vendorId,
            @PathVariable UUID notificationId) {
        try {
            notificationService.marquerCommeLue(notificationId, vendorId);
            return ResponseEntity.ok("Notification marquée comme lue");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}