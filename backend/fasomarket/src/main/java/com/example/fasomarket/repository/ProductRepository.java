package com.example.fasomarket.repository;

import com.example.fasomarket.model.Product;
import com.example.fasomarket.model.Shop;
import com.example.fasomarket.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByShop(Shop shop);
    List<Product> findByIsActiveTrue();
    Page<Product> findByIsActiveTrue(Pageable pageable);
    List<Product> findByIsActiveTrueAndAvailableTrue();
    List<Product> findByIsActiveTrueAndCategoryContainingIgnoreCase(String category);
    List<Product> findByIsActiveTrueAndNameContainingIgnoreCase(String name);
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
    Optional<Product> findByIdAndIsActiveTrue(UUID id);
    List<Product> findByIsActiveTrueAndNameContainingIgnoreCaseAndCategoryContainingIgnoreCase(String name, String category);
    List<Product> findByIsActiveTrueAndCategoryEntity(Category category);
    List<Product> findByShopAndIsActiveTrue(Shop shop);
    boolean existsBySku(String sku);
    long countByIsActiveTrue();
    long countByIsActive(boolean isActive);
    long countByShop(Shop shop);
    
    // Méthode pour recommandations client
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.createdAt DESC LIMIT 5")
    List<Product> findTop5ByOrderByCreatedAtDesc();
}