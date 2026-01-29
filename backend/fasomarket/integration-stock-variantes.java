// Exemple d'intégration dans CartService.java

@Autowired
private StockVarianteService stockVarianteService;

@Transactional
public void ajouterAuPanier(UUID clientId, AjouterPanierRequest request) {
    // Vérifier la disponibilité de la variante si spécifiée
    if (request.getVarianteId() != null) {
        boolean disponible = stockVarianteService.isVarianteDisponible(
            request.getVarianteId(), request.getQuantite()
        );
        if (!disponible) {
            throw new RuntimeException("Stock insuffisant pour cette variante");
        }
        
        // Réserver le stock
        boolean reserve = stockVarianteService.reserverStock(
            request.getVarianteId(), request.getQuantite()
        );
        if (!reserve) {
            throw new RuntimeException("Impossible de réserver le stock");
        }
    }
    
    // Logique existante d'ajout au panier...
}

@Transactional
public void supprimerDuPanier(UUID clientId, UUID itemId) {
    // Récupérer l'item avant suppression
    CartItem item = getCartItem(itemId);
    
    // Libérer le stock réservé si variante
    if (item.getVarianteId() != null) {
        stockVarianteService.libererStock(item.getVarianteId(), item.getQuantity());
    }
    
    // Logique existante de suppression...
}

// Exemple d'intégration dans OrderService.java

@Transactional
public Order creerCommande(UUID clientId, CreerCommandeRequest request) {
    // Lors de la création de commande, confirmer les ventes
    for (OrderItem item : order.getOrderItems()) {
        if (item.getVarianteId() != null) {
            boolean confirme = stockVarianteService.confirmerVente(
                item.getVarianteId(), item.getQuantity()
            );
            if (!confirme) {
                throw new RuntimeException("Stock insuffisant pour finaliser la commande");
            }
        }
    }
    
    // Logique existante de création...
}