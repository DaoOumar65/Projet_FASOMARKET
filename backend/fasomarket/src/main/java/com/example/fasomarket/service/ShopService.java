package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public BoutiqueResponse creerBoutique(UUID vendorUserId, CreerBoutiqueRequest request) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!user.getRole().equals(Role.VENDOR)) {
            throw new RuntimeException("Seuls les vendeurs peuvent créer une boutique");
        }

        Vendor vendor = vendorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profil vendeur non trouvé"));

        if (!vendor.getStatus().equals(VendorStatus.COMPTE_VALIDE)) {
            throw new RuntimeException("Votre compte vendeur doit être approuvé pour créer une boutique");
        }

        // Vérifier qu'il n'a pas déjà une boutique
        if (shopRepository.existsByVendor(vendor)) {
            throw new RuntimeException("Vous avez déjà une boutique. Un vendeur ne peut avoir qu'une seule boutique");
        }

        if (shopRepository.existsByName(request.getNom())) {
            throw new RuntimeException("Ce nom de boutique est déjà utilisé");
        }

        Shop shop = new Shop(vendor, request.getNom(), request.getDescription(),
                request.getTelephone(), request.getAdresse());

        // Définir le statut initial comme BROUILLON
        shop.setStatus(ShopStatus.BROUILLON);
        shop.setEmail(request.getEmail());
        shop.setLogoUrl(request.getLogoUrl());
        shop.setBannerUrl(request.getBannerUrl());
        shop.setCategory(request.getCategorie());

        // Gérer la catégorie
        if (request.getCategorie() != null && !request.getCategorie().trim().isEmpty()) {
            Category category = categoryService.obtenirOuCreerCategorie(request.getCategorie());
            shop.setCategoryEntity(category);
        }

        shop.setOpeningHours(request.getHorairesOuverture());
        shop.setSocialLinks(request.getLiensReseauxSociaux());
        shop.setDelivery(request.getLivraison());
        shop.setDeliveryFee(request.getFraisLivraison());
        shop.setTags(request.getTags());
        shop.setDateSoumission(LocalDateTime.now()); // Set submission date immediately

        shop = shopRepository.save(shop);
        final Shop savedShop = shop;
        final Vendor finalVendor = vendor;

        // Notification de création de boutique
        notificationService.creerNotification(
                vendorUserId,
                "Boutique Créée et Soumise",
                "Votre boutique '" + savedShop.getName()
                        + "' a été créée et soumise pour validation. Vous recevrez une réponse sous 24-48h.");

        // Notifier l'admin des nouvelles boutiques à valider
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> {
            notificationService.creerNotification(
                    admin.getId(),
                    "Nouvelle boutique à valider",
                    "La boutique '" + savedShop.getName() + "' de " + finalVendor.getUser().getFullName()
                            + " est en attente de validation");
        });

        return mapToResponse(savedShop);
    }

    public BoutiqueResponse soumettreBoutique(UUID vendorUserId, UUID boutiqueId) {
        Shop shop = shopRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        if (!shop.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à soumettre cette boutique");
        }

        if (!shop.getStatus().equals(ShopStatus.EN_ATTENTE_APPROBATION)) {
            throw new RuntimeException("Cette boutique est déjà soumise ou validée");
        }

        // La boutique est déjà en attente d'approbation, pas besoin de changer le statut
        shop.setDateSoumission(LocalDateTime.now());
        final Shop finalShop = shopRepository.save(shop);

        // Notification de soumission au vendeur
        notificationService.creerNotification(
                finalShop.getVendor().getUser().getId(),
                "Boutique Soumise",
                "Votre boutique '" + finalShop.getName()
                        + "' a été soumise pour validation. Vous recevrez une réponse sous 24-48h.");

        // Notifier l'admin des nouvelles boutiques à valider
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> {
            notificationService.creerNotification(
                    admin.getId(),
                    "Nouvelle boutique à valider",
                    "La boutique '" + finalShop.getName() + "' de " + finalShop.getVendor().getUser().getFullName()
                            + " est en attente de validation");
        });

        return mapToResponse(finalShop);
    }

    public BoutiqueResponse obtenirBoutiqueVendeur(UUID vendorUserId) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Vendor vendor = vendorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profil vendeur non trouvé"));

        return shopRepository.findByVendor(vendor)
                .stream()
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null); // Retourner null au lieu de lancer une exception
    }

    public List<BoutiqueResponse> obtenirBoutiquesActives() {
        return shopRepository.findByStatus(ShopStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BoutiqueResponse modifierBoutique(UUID vendorUserId, UUID boutiqueId, ModifierBoutiqueRequest request) {
        Shop shop = shopRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        if (!shop.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette boutique");
        }

        if (request.getNom() != null && !request.getNom().equals(shop.getName())) {
            if (shopRepository.existsByName(request.getNom())) {
                throw new RuntimeException("Ce nom de boutique est déjà utilisé");
            }
            shop.setName(request.getNom());
        }

        if (request.getDescription() != null)
            shop.setDescription(request.getDescription());
        if (request.getTelephone() != null)
            shop.setPhone(request.getTelephone());
        if (request.getAdresse() != null)
            shop.setAddress(request.getAdresse());
        if (request.getEmail() != null)
            shop.setEmail(request.getEmail());
        if (request.getLogoUrl() != null)
            shop.setLogoUrl(request.getLogoUrl());
        if (request.getBannerUrl() != null)
            shop.setBannerUrl(request.getBannerUrl());
        if (request.getCategorie() != null)
            shop.setCategory(request.getCategorie());
        if (request.getHorairesOuverture() != null)
            shop.setOpeningHours(request.getHorairesOuverture());
        if (request.getLiensReseauxSociaux() != null)
            shop.setSocialLinks(request.getLiensReseauxSociaux());
        if (request.getLivraison() != null)
            shop.setDelivery(request.getLivraison());
        if (request.getFraisLivraison() != null)
            shop.setDeliveryFee(request.getFraisLivraison());
        if (request.getTags() != null)
            shop.setTags(request.getTags());

        shop = shopRepository.save(shop);
        return mapToResponse(shop);
    }

    @Transactional
    public void supprimerBoutique(UUID vendorUserId, UUID boutiqueId) {
        Shop shop = shopRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        if (!shop.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette boutique");
        }

        shopRepository.delete(shop);
    }

    public List<BoutiqueResponse> rechercherBoutiques(String nom, String categorie) {
        if (nom != null && categorie != null) {
            return shopRepository.findByStatusAndNameContainingIgnoreCaseAndCategoryContainingIgnoreCase(
                    ShopStatus.ACTIVE, nom, categorie)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else if (nom != null) {
            return shopRepository.findByStatusAndNameContainingIgnoreCase(ShopStatus.ACTIVE, nom)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else if (categorie != null) {
            return shopRepository.findByStatusAndCategoryContainingIgnoreCase(ShopStatus.ACTIVE, categorie)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            return obtenirBoutiquesActives();
        }
    }

    public BoutiqueResponse obtenirBoutique(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));
        
        // Seules les boutiques actives sont visibles par les clients
        if (!shop.getStatus().equals(ShopStatus.ACTIVE)) {
            throw new RuntimeException("Boutique non disponible");
        }
        
        return mapToResponse(shop);
    }

    private BoutiqueResponse mapToResponse(Shop shop) {
        BoutiqueResponse response = new BoutiqueResponse();
        response.setId(shop.getId());
        response.setNom(shop.getName());
        response.setDescription(shop.getDescription());
        response.setLogoUrl(shop.getLogoUrl());
        response.setBannerUrl(shop.getBannerUrl());
        response.setEmail(shop.getEmail());
        response.setTelephone(shop.getPhone());
        response.setAdresse(shop.getAddress());
        response.setStatut(shop.getStatus());
        response.setCategorie(shop.getCategory());
        response.setHorairesOuverture(shop.getOpeningHours());
        response.setNote(shop.getRating());
        response.setNombreAvis(shop.getReviewsCount());
        response.setLiensReseauxSociaux(shop.getSocialLinks());
        response.setLivraison(shop.getDelivery());
        response.setFraisLivraison(shop.getDeliveryFee());
        response.setTags(shop.getTags());
        response.setDateCreation(shop.getCreatedAt());
        response.setDateModification(shop.getUpdatedAt());
        return response;
    }

    // Méthodes manquantes pour les statistiques
    public long compterBoutiquesActives() {
        return shopRepository.countByStatus(ShopStatus.ACTIVE);
    }

    public long compterBoutiquesParCategorie(String categorie) {
        return shopRepository.countByStatusAndCategory(ShopStatus.ACTIVE, categorie);
    }
}