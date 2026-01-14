package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.*;
import com.example.fasomarket.repository.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.model.VendorStatus;
import com.example.fasomarket.model.ProductStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Interface Admin", description = "API pour le dashboard administrateur")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard admin", description = "Vue d'ensemble de la plateforme")
    public ResponseEntity<?> getDashboard() {
        try {
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> statistiques = new HashMap<>();

            // Données réelles de la base de données
            long totalUtilisateurs = userRepository.count();
            long totalBoutiques = shopRepository.count();
            long totalProduits = productRepository.count();
            long totalCommandes = orderRepository.count();
            long totalVendeurs = userRepository.countByRole(Role.VENDOR);
            long totalClients = userRepository.countByRole(Role.CLIENT);
            long boutiquesActives = shopRepository.countByStatus(ShopStatus.ACTIVE);
            long boutiquesEnAttente = shopRepository.countByStatus(ShopStatus.EN_ATTENTE_APPROBATION);

            statistiques.put("totalUtilisateurs", totalUtilisateurs);
            statistiques.put("totalBoutiques", totalBoutiques);
            statistiques.put("totalProduits", totalProduits);
            statistiques.put("totalCommandes", totalCommandes);
            statistiques.put("totalVendeurs", totalVendeurs);
            statistiques.put("totalClients", totalClients);
            statistiques.put("boutiquesActives", boutiquesActives);
            statistiques.put("boutiquesEnAttente", boutiquesEnAttente);

            // Commandes aujourd'hui
            long commandesAujourdhui = orderRepository.findAll().stream()
                    .filter(c -> c.getCreatedAt().toLocalDate().equals(java.time.LocalDate.now()))
                    .count();
            statistiques.put("commandesAujourdhui", commandesAujourdhui);

            // Chiffre d'affaires
            double chiffreAffairesTotal = orderRepository.findAll().stream()
                    .mapToDouble(c -> c.getTotalAmount().doubleValue())
                    .sum();
            statistiques.put("chiffreAffairesTotal", chiffreAffairesTotal);

            response.put("statistiques", statistiques);

            // Listes pour les sections du dashboard (données simulées)
            List<Vendor> vendorsEnAttente = vendorRepository.findByStatus(VendorStatus.EN_ATTENTE_VALIDATION);
            response.put("vendeursEnAttente", vendorsEnAttente.subList(0, Math.min(5, vendorsEnAttente.size())));

            List<Shop> shopsEnAttente = shopRepository.findByStatus(ShopStatus.EN_ATTENTE_APPROBATION);
            response.put("boutiquesEnAttente", shopsEnAttente.subList(0, Math.min(5, shopsEnAttente.size())));

            // Commandes récentes - retourner seulement les infos essentielles
            List<Order> commandesRecentes = orderRepository.findAll();
            List<Map<String, Object>> commandesData = commandesRecentes.stream()
                .limit(10)
                .map(order -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", order.getId());
                    data.put("status", order.getStatus());
                    data.put("totalAmount", order.getTotalAmount());
                    data.put("deliveryAddress", order.getDeliveryAddress());
                    data.put("createdAt", order.getCreatedAt());
                    if (order.getClient() != null) {
                        data.put("clientName", order.getClient().getFullName());
                    }
                    return data;
                })
                .collect(java.util.stream.Collectors.toList());
            response.put("commandesRecentes", commandesData);

            response.put("alertes", new ArrayList<>());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/utilisateurs")
    @Operation(summary = "Gestion utilisateurs", description = "Liste tous les utilisateurs avec filtres")
    public ResponseEntity<?> obtenirUtilisateurs(
            @RequestHeader("X-User-Id") UUID adminId,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            var users = role != null ? userRepository.findByRole(role) : userRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("utilisateurs", users);
            response.put("total", users.size());
            response.put("page", page);
            response.put("size", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des utilisateurs");
        }
    }

    @PostMapping("/utilisateurs/{userId}/bloquer")
    @Operation(summary = "Bloquer utilisateur", description = "Désactive un compte utilisateur")
    public ResponseEntity<?> bloquerUtilisateur(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            user.setIsActive(false);
            userRepository.save(user);

            return ResponseEntity.ok("Utilisateur bloqué");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du blocage");
        }
    }

    @PostMapping("/utilisateurs/{userId}/debloquer")
    @Operation(summary = "Débloquer utilisateur", description = "Réactive un compte utilisateur")
    public ResponseEntity<?> debloquerUtilisateur(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            user.setIsActive(true);
            userRepository.save(user);

            return ResponseEntity.ok("Utilisateur débloqué");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du déblocage");
        }
    }

    @GetMapping("/utilisateurs/{userId}/details")
    @Operation(summary = "Détails utilisateur", description = "Informations détaillées d'un utilisateur")
    public ResponseEntity<?> obtenirDetailsUtilisateur(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des détails");
        }
    }

    @GetMapping("/validations")
    @Operation(summary = "Validations en attente", description = "Vendeurs et boutiques à valider")
    public ResponseEntity<?> obtenirValidationsEnAttente(@RequestHeader("X-User-Id") UUID adminId) {
        try {
            Map<String, Object> response = new HashMap<>();

            // Vendeurs en attente
            List<Vendor> vendeurs = vendorRepository.findByStatus(VendorStatus.EN_ATTENTE_VALIDATION);
            List<Map<String, Object>> vendeursData = vendeurs.stream().map(vendor -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", vendor.getId());
                data.put("nomComplet", vendor.getUser().getFullName());
                data.put("telephone", vendor.getUser().getPhone());
                data.put("email", vendor.getUser().getEmail());
                data.put("carteIdentite", vendor.getIdCard());
                data.put("status", vendor.getStatus());
                data.put("createdAt", vendor.getCreatedAt());
                return data;
            }).collect(java.util.stream.Collectors.toList());

            // Boutiques en attente
            List<Shop> boutiques = shopRepository.findByStatus(ShopStatus.EN_ATTENTE_APPROBATION);
            List<Map<String, Object>> boutiquesData = boutiques.stream().map(shop -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", shop.getId());
                data.put("name", shop.getName());
                data.put("description", shop.getDescription());
                data.put("phone", shop.getPhone());
                data.put("address", shop.getAddress());
                data.put("status", shop.getStatus());
                data.put("dateSoumission", shop.getDateSoumission());

                if (shop.getVendor() != null) {
                    Map<String, Object> vendorData = new HashMap<>();
                    vendorData.put("id", shop.getVendor().getId());
                    vendorData.put("nomComplet", shop.getVendor().getUser().getFullName());
                    vendorData.put("telephone", shop.getVendor().getUser().getPhone());
                    data.put("vendeur", vendorData);
                }

                return data;
            }).collect(java.util.stream.Collectors.toList());

            response.put("vendeursEnAttente", vendeursData);
            response.put("boutiquesEnAttente", boutiquesData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des validations");
        }
    }

    @PutMapping("/vendeurs/{vendorId}/valider")
    @Operation(summary = "Valider vendeur", description = "Approuve ou rejette un vendeur")
    public ResponseEntity<?> validerVendeur(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID vendorId,
            @RequestParam VendorStatus statut,
            @RequestParam(required = false) String raison) {
        try {
            var vendor = vendorRepository.findById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendeur non trouvé"));

            vendor.setStatus(statut);

            if (statut == VendorStatus.COMPTE_VALIDE) {
                vendor.setDateValidationCompte(LocalDateTime.now());
                vendor.setValideParAdminId(adminId);
                vendorRepository.save(vendor);

                // Envoyer notification
                notificationService.creerNotification(
                        vendor.getUser().getId(),
                        "Compte Vendeur Approuvé",
                        "Félicitations ! Votre compte vendeur a été approuvé. Vous pouvez maintenant créer votre boutique.");

                // Envoyer email
                emailService.envoyerEmailApprobationVendeur(
                        vendor.getUser().getEmail(),
                        vendor.getUser().getFullName(),
                        "motdepasse123" // Mot de passe temporaire
                );

                return ResponseEntity.ok("Vendeur approuvé, notification et email envoyés");
            } else if (statut == VendorStatus.REFUSE) {
                vendor.setRaisonRefus(raison);
                vendorRepository.save(vendor);

                // Envoyer notification
                notificationService.creerNotification(
                        vendor.getUser().getId(),
                        "Compte Vendeur Rejeté",
                        "Votre demande de compte vendeur n'a pas été approuvée. "
                                + (raison != null ? "Raison: " + raison : ""));

                // Envoyer email
                emailService.envoyerEmailRejetVendeur(
                        vendor.getUser().getEmail(),
                        vendor.getUser().getFullName(),
                        raison);

                return ResponseEntity.ok("Vendeur rejeté, notification et email envoyés");
            }

            vendorRepository.save(vendor);
            return ResponseEntity.ok("Statut vendeur mis à jour");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la validation: " + e.getMessage());
        }
    }

    @GetMapping("/boutiques")
    @Operation(summary = "Gestion boutiques", description = "Liste toutes les boutiques")
    public ResponseEntity<?> obtenirBoutiques(@RequestHeader("X-User-Id") UUID adminId) {
        try {
            List<Shop> boutiques = shopRepository.findAll();
            List<Map<String, Object>> response = boutiques.stream().map(shop -> {
                Map<String, Object> shopData = new HashMap<>();
                shopData.put("id", shop.getId());
                shopData.put("name", shop.getName());
                shopData.put("description", shop.getDescription());
                shopData.put("phone", shop.getPhone());
                shopData.put("address", shop.getAddress());
                shopData.put("email", shop.getEmail());
                shopData.put("status", shop.getStatus());
                shopData.put("category", shop.getCategory());
                shopData.put("rating", shop.getRating());
                shopData.put("reviewsCount", shop.getReviewsCount());
                shopData.put("delivery", shop.getDelivery());
                shopData.put("deliveryFee", shop.getDeliveryFee());
                shopData.put("createdAt", shop.getCreatedAt());
                shopData.put("updatedAt", shop.getUpdatedAt());

                // Infos vendeur
                if (shop.getVendor() != null) {
                    Map<String, Object> vendorData = new HashMap<>();
                    vendorData.put("id", shop.getVendor().getId());
                    vendorData.put("nomComplet", shop.getVendor().getUser().getFullName());
                    vendorData.put("telephone", shop.getVendor().getUser().getPhone());
                    vendorData.put("email", shop.getVendor().getUser().getEmail());
                    vendorData.put("status", shop.getVendor().getStatus());
                    shopData.put("vendeur", vendorData);
                }

                return shopData;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des boutiques");
        }
    }

    @GetMapping("/boutiques/{id}/details")
    @Operation(summary = "Détails boutique", description = "Informations détaillées d'une boutique")
    public ResponseEntity<?> getBoutiqueDetails(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID id) {
        try {
            Shop boutique = shopRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", boutique.getId());
            response.put("name", boutique.getName());
            response.put("description", boutique.getDescription());
            response.put("phone", boutique.getPhone());
            response.put("address", boutique.getAddress());
            response.put("email", boutique.getEmail());
            response.put("status", boutique.getStatus());
            response.put("category", boutique.getCategory());
            response.put("rating", boutique.getRating());
            response.put("reviewsCount", boutique.getReviewsCount());
            response.put("delivery", boutique.getDelivery());
            response.put("deliveryFee", boutique.getDeliveryFee());
            response.put("createdAt", boutique.getCreatedAt());
            response.put("updatedAt", boutique.getUpdatedAt());
            response.put("dateSoumission", boutique.getDateSoumission());
            response.put("dateValidation", boutique.getDateValidation());
            response.put("raisonRejet", boutique.getRaisonRejet());

            if (boutique.getVendor() != null) {
                Map<String, Object> vendorData = new HashMap<>();
                vendorData.put("id", boutique.getVendor().getId());
                vendorData.put("nomComplet", boutique.getVendor().getUser().getFullName());
                vendorData.put("telephone", boutique.getVendor().getUser().getPhone());
                vendorData.put("email", boutique.getVendor().getUser().getEmail());
                vendorData.put("status", boutique.getVendor().getStatus());
                vendorData.put("idCard", boutique.getVendor().getIdCard());
                vendorData.put("dateCreation", boutique.getVendor().getCreatedAt());
                response.put("vendeur", vendorData);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/boutiques/{id}/statut")
    @Operation(summary = "Changer statut boutique", description = "Modifie le statut d'une boutique")
    public ResponseEntity<?> changerStatutBoutique(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID id,
            @RequestParam ShopStatus statut) {
        try {
            Shop boutique = shopRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

            boutique.setStatus(statut);
            shopRepository.save(boutique);

            return ResponseEntity.ok("Statut de la boutique mis à jour");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du statut");
        }
    }

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
                        "Félicitations ! Votre boutique '" + boutique.getName()
                                + "' a été approuvée et est maintenant active.");

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

    @GetMapping("/produits")
    @Operation(summary = "Gestion produits", description = "Liste tous les produits avec pagination")
    public ResponseEntity<?> obtenirProduits(
            @RequestHeader("X-User-Id") UUID adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Product> produits = productRepository.findAll();
            List<ProductAdminDTO> produitsDTO = produits.stream()
                    .map(this::convertProductToAdminDTO)
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("produits", produitsDTO);
            response.put("total", produitsDTO.size());
            response.put("page", page);
            response.put("size", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des produits");
        }
    }

    private ProductAdminDTO convertProductToAdminDTO(Product product) {
        ProductAdminDTO dto = new ProductAdminDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory());
        dto.setImages(product.getImages());
        dto.setStatus(product.getStatus() != null ? product.getStatus().name() : null);
        dto.setIsActive(product.getIsActive());
        dto.setAvailable(product.getAvailable());
        dto.setFeatured(product.getFeatured());
        dto.setDiscount(product.getDiscount());
        dto.setRating(product.getRating() != null ? product.getRating().doubleValue() : null);
        dto.setReviewsCount(product.getReviewsCount());
        dto.setMinOrderQuantity(product.getMinOrderQuantity());
        dto.setSalesCount(product.getSalesCount() != null ? product.getSalesCount().intValue() : 0);
        dto.setViewsCount(product.getViewsCount() != null ? product.getViewsCount().intValue() : 0);
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        if (product.getShop() != null) {
            dto.setShopId(product.getShop().getId());
            dto.setShopName(product.getShop().getName());
            dto.setShopStatus(product.getShop().getStatus() != null ? product.getShop().getStatus().name() : null);

            if (product.getShop().getVendor() != null && product.getShop().getVendor().getUser() != null) {
                dto.setVendorId(product.getShop().getVendor().getUser().getId());
                dto.setVendorName(product.getShop().getVendor().getUser().getFullName());
                dto.setVendorPhone(product.getShop().getVendor().getUser().getPhone());
                dto.setVendorEmail(product.getShop().getVendor().getUser().getEmail());
            }
        }

        return dto;
    }

    @PutMapping("/produits/{id}/statut")
    @Operation(summary = "Changer statut produit", description = "Active ou masque un produit")
    public ResponseEntity<?> changerStatutProduit(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID id,
            @RequestParam ProductStatus statut) {
        try {
            Product produit = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

            produit.setStatus(statut);
            productRepository.save(produit);

            return ResponseEntity.ok("Statut du produit mis à jour");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du statut");
        }
    }

    @GetMapping("/commandes")
    @Operation(summary = "Gestion commandes", description = "Liste toutes les commandes")
    public ResponseEntity<?> obtenirCommandes(@RequestHeader("X-User-Id") UUID adminId) {
        try {
            List<Order> commandes = orderRepository.findAll();
            List<Map<String, Object>> commandesData = commandes.stream()
                .map(order -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", order.getId());
                    data.put("status", order.getStatus());
                    data.put("totalAmount", order.getTotalAmount());
                    data.put("deliveryAddress", order.getDeliveryAddress());
                    data.put("needsDelivery", order.getNeedsDelivery());
                    data.put("deliveryPhone", order.getDeliveryPhone());
                    data.put("createdAt", order.getCreatedAt());
                    data.put("updatedAt", order.getUpdatedAt());
                    if (order.getClient() != null) {
                        data.put("clientId", order.getClient().getId());
                        data.put("clientName", order.getClient().getFullName());
                        data.put("clientPhone", order.getClient().getPhone());
                    }
                    data.put("itemsCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
                    return data;
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(commandesData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des commandes");
        }
    }

    @GetMapping("/commandes/statistiques")
    @Operation(summary = "Statistiques commandes", description = "Statistiques détaillées des commandes")
    public ResponseEntity<?> obtenirStatistiquesCommandes(@RequestHeader("X-User-Id") UUID adminId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            List<Order> commandes = orderRepository.findAll();

            stats.put("totalCommandes", commandes.size());
            stats.put("commandesAujourdhui", commandes.stream()
                    .filter(c -> c.getCreatedAt().toLocalDate().equals(java.time.LocalDate.now()))
                    .count());
            stats.put("chiffreAffairesTotal", commandes.stream()
                    .mapToDouble(c -> c.getTotalAmount().doubleValue())
                    .sum());
            stats.put("panierMoyen", commandes.isEmpty() ? 0
                    : commandes.stream().mapToDouble(c -> c.getTotalAmount().doubleValue()).average().orElse(0));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des statistiques");
        }
    }

    @PutMapping("/commandes/{id}/statut")
    @Operation(summary = "Changer statut commande", description = "Modifie le statut d'une commande")
    public ResponseEntity<?> changerStatutCommande(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID id,
            @RequestParam OrderStatus statut) {
        try {
            Order commande = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

            commande.setStatus(statut);
            orderRepository.save(commande);

            return ResponseEntity.ok("Statut de la commande mis à jour");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du statut");
        }
    }

    @PostMapping("/categories/creer")
    @Operation(summary = "Créer catégorie", description = "Crée une nouvelle catégorie")
    public ResponseEntity<?> creerCategorie(
            @RequestHeader("X-User-Id") UUID adminId,
            @Valid @RequestBody CreerCategorieRequest request) {
        try {
            CategorieResponse response = categoryService.creerCategorie(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/categories")
    @Operation(summary = "Gestion catégories", description = "Liste toutes les catégories")
    public ResponseEntity<?> obtenirCategories(@RequestHeader("X-User-Id") UUID adminId) {
        try {
            List<Category> categories = categoryRepository.findAll();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des catégories");
        }
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Modifier catégorie", description = "Met à jour une catégorie")
    public ResponseEntity<?> modifierCategorie(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID id,
            @Valid @RequestBody CreerCategorieRequest request) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

            category.setName(request.getNom());
            category.setDescription(request.getDescription());
            categoryRepository.save(category);

            return ResponseEntity.ok("Catégorie modifiée");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la modification");
        }
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Supprimer catégorie", description = "Supprime une catégorie")
    public ResponseEntity<?> supprimerCategorie(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID id) {
        try {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok("Catégorie supprimée");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la suppression");
        }
    }

    @PostMapping("/notifications/diffuser")
    @Operation(summary = "Diffuser notification", description = "Envoie une notification à tous les utilisateurs")
    public ResponseEntity<?> diffuserNotification(
            @RequestHeader("X-User-Id") UUID adminId,
            @RequestParam String titre,
            @RequestParam String message) {
        try {
            List<User> users = userRepository.findAll();
            users.forEach(user -> {
                notificationService.creerNotification(user.getId(), titre, message);
            });

            return ResponseEntity.ok("Notification diffusée à " + users.size() + " utilisateurs");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la diffusion");
        }
    }

    @PutMapping("/utilisateurs/{userId}/email")
    @Operation(summary = "Mettre à jour email", description = "Met à jour l'email d'un utilisateur")
    public ResponseEntity<?> mettreAJourEmail(
            @RequestHeader("X-User-Id") UUID adminId,
            @PathVariable UUID userId,
            @RequestParam String email) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            user.setEmail(email);
            userRepository.save(user);

            return ResponseEntity.ok("Email mis à jour: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour de l'email");
        }
    }

    @GetMapping("/systeme/statistiques")
    @Operation(summary = "Statistiques système", description = "Statistiques globales du système")
    public ResponseEntity<?> obtenirStatistiquesSysteme(@RequestHeader("X-User-Id") UUID adminId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUtilisateurs", userRepository.count());
            stats.put("utilisateursActifs", userRepository.countByIsActive(true));
            stats.put("totalBoutiques", shopRepository.count());
            stats.put("boutiquesActives", shopRepository.countByStatus(ShopStatus.ACTIVE));
            stats.put("totalProduits", productRepository.count());
            stats.put("totalCommandes", orderRepository.count());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement des statistiques système");
        }
    }
}