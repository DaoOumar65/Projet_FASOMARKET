package com.example.fasomarket.service;

import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StockVarianteService {

    @Autowired
    private ProduitVarianteService produitVarianteService;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Vérifier la disponibilité d'une variante
     */
    public boolean isVarianteDisponible(Long varianteId, int quantiteDemandee) {
        try {
            ProduitVariante variante = produitVarianteService.getVarianteById(varianteId.toString());
            return variante.getStock() >= quantiteDemandee;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Réserver du stock pour une variante (lors d'un ajout au panier)
     */
    @Transactional
    public boolean reserverStock(Long varianteId, int quantite) {
        try {
            ProduitVariante variante = produitVarianteService.getVarianteById(varianteId.toString());
            
            if (variante.getStock() >= quantite) {
                // Réduire le stock temporairement (réservation)
                variante.setStock(variante.getStock() - quantite);
                produitVarianteService.modifierVariante(variante);
                
                // Mettre à jour le stock total du produit
                mettreAJourStockProduit(variante.getProduit());
                
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Libérer du stock réservé (lors de suppression du panier)
     */
    @Transactional
    public void libererStock(Long varianteId, int quantite) {
        try {
            ProduitVariante variante = produitVarianteService.getVarianteById(varianteId.toString());
            variante.setStock(variante.getStock() + quantite);
            produitVarianteService.modifierVariante(variante);
            
            // Mettre à jour le stock total du produit
            mettreAJourStockProduit(variante.getProduit());
        } catch (Exception e) {
            // Log l'erreur mais ne pas faire échouer l'opération
            System.err.println("Erreur libération stock variante: " + e.getMessage());
        }
    }

    /**
     * Confirmer la vente (stock définitivement vendu)
     */
    @Transactional
    public boolean confirmerVente(Long varianteId, int quantite) {
        try {
            ProduitVariante variante = produitVarianteService.getVarianteById(varianteId.toString());
            
            if (variante.getStock() >= quantite) {
                // Le stock a déjà été réduit lors de la réservation
                // Juste vérifier et envoyer des alertes si nécessaire
                checkStockAlerts(variante);
                
                // Mettre à jour le stock total du produit
                mettreAJourStockProduit(variante.getProduit());
                
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Réapprovisionner une variante spécifique
     */
    @Transactional
    public void reapprovisionnerVariante(UUID vendorUserId, Long varianteId, int quantite) {
        try {
            ProduitVariante variante = produitVarianteService.getVarianteById(varianteId.toString());
            
            // Vérifier que le vendeur est propriétaire
            if (!variante.getProduit().getShop().getVendor().getUser().getId().equals(vendorUserId)) {
                throw new RuntimeException("Non autorisé");
            }
            
            // Ajouter le stock
            variante.setStock(variante.getStock() + quantite);
            produitVarianteService.modifierVariante(variante);
            
            // Mettre à jour le stock total du produit
            mettreAJourStockProduit(variante.getProduit());
            
            // Notification
            notificationService.creerNotification(
                vendorUserId,
                "✅ Réapprovisionnement effectué",
                "La variante " + getVarianteDescription(variante) + " a été réapprovisionnée de " + quantite + " unités."
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur réapprovisionnement: " + e.getMessage());
        }
    }

    /**
     * Obtenir le stock total d'un produit (somme de toutes ses variantes)
     */
    public int getStockTotalProduit(UUID produitId) {
        try {
            List<ProduitVariante> variantes = produitVarianteService.getVariantesByProduitId(produitId.toString());
            return variantes.stream().mapToInt(ProduitVariante::getStock).sum();
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Obtenir les variantes en rupture de stock
     */
    public List<ProduitVariante> getVariantesEnRupture(UUID vendorUserId) {
        try {
            List<ProduitVariante> toutesVariantes = produitVarianteService.getVariantesByVendeur(vendorUserId);
            return toutesVariantes.stream()
                .filter(v -> v.getStock() <= 0)
                .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Obtenir les variantes avec stock faible
     */
    public List<ProduitVariante> getVariantesStockFaible(UUID vendorUserId, int seuil) {
        try {
            List<ProduitVariante> toutesVariantes = produitVarianteService.getVariantesByVendeur(vendorUserId);
            return toutesVariantes.stream()
                .filter(v -> v.getStock() > 0 && v.getStock() <= seuil)
                .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Mettre à jour le stock total du produit parent
     */
    private void mettreAJourStockProduit(Product product) {
        try {
            int stockTotal = getStockTotalProduit(product.getId());
            product.setStockQuantity(stockTotal);
            product.setAvailable(stockTotal > 0);
            productRepository.save(product);
        } catch (Exception e) {
            System.err.println("Erreur mise à jour stock produit: " + e.getMessage());
        }
    }

    /**
     * Vérifier et envoyer des alertes de stock
     */
    private void checkStockAlerts(ProduitVariante variante) {
        if (variante.getStock() <= 0) {
            // Rupture de stock
            notificationService.creerNotification(
                variante.getProduit().getShop().getVendor().getUser().getId(),
                "🚫 Rupture de stock",
                "La variante " + getVarianteDescription(variante) + " est en rupture de stock."
            );
        } else if (variante.getStock() <= 5) {
            // Stock faible
            notificationService.creerNotification(
                variante.getProduit().getShop().getVendor().getUser().getId(),
                "⚠️ Stock faible",
                "La variante " + getVarianteDescription(variante) + " n'a plus que " + variante.getStock() + " unités."
            );
        }
    }

    /**
     * Obtenir une description lisible de la variante
     */
    private String getVarianteDescription(ProduitVariante variante) {
        StringBuilder desc = new StringBuilder();
        if (variante.getCouleur() != null) desc.append(variante.getCouleur());
        if (variante.getTaille() != null) {
            if (desc.length() > 0) desc.append(" - ");
            desc.append(variante.getTaille());
        }
        if (variante.getModele() != null && !variante.getModele().equals("Standard")) {
            if (desc.length() > 0) desc.append(" - ");
            desc.append(variante.getModele());
        }
        return desc.length() > 0 ? desc.toString() : "Variante " + variante.getId();
    }
}