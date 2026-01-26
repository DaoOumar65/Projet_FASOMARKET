package com.example.fasomarket.service;

import com.example.fasomarket.model.Product;
import com.example.fasomarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${stock.alert.threshold:5}")
    private int stockAlertThreshold;

    @Value("${stock.alert.enabled:true}")
    private boolean stockAlertEnabled;

    @Transactional
    public void decrementStock(Product product, int quantity) {
        int newStock = product.getStockQuantity() - quantity;
        product.setStockQuantity(newStock);
        productRepository.save(product);

        // Vérifier si alerte nécessaire
        if (stockAlertEnabled && newStock <= stockAlertThreshold && newStock > 0) {
            sendLowStockAlert(product, newStock);
        } else if (newStock <= 0) {
            sendOutOfStockAlert(product);
        }
    }

    @Transactional
    public void incrementStock(Product product, int quantity) {
        int newStock = product.getStockQuantity() + quantity;
        product.setStockQuantity(newStock);
        productRepository.save(product);
    }

    private void sendLowStockAlert(Product product, int currentStock) {
        if (product.getShop() != null && product.getShop().getVendor() != null) {
            notificationService.creerNotification(
                product.getShop().getVendor().getUser().getId(),
                "⚠️ Stock faible",
                "Le produit \"" + product.getName() + "\" n'a plus que " + currentStock + " unités en stock. Pensez à le réapprovisionner."
            );
        }
    }

    private void sendOutOfStockAlert(Product product) {
        if (product.getShop() != null && product.getShop().getVendor() != null) {
            // Désactiver le produit automatiquement
            product.setAvailable(false);
            productRepository.save(product);

            notificationService.creerNotification(
                product.getShop().getVendor().getUser().getId(),
                "🚫 Rupture de stock",
                "Le produit \"" + product.getName() + "\" est en rupture de stock et a été désactivé automatiquement."
            );
        }
    }

    public boolean isStockSufficient(Product product, int requestedQuantity) {
        return product.getStockQuantity() >= requestedQuantity && product.getAvailable();
    }
}