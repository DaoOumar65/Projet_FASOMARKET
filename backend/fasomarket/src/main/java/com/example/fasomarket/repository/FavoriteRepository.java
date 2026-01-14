package com.example.fasomarket.repository;

import com.example.fasomarket.model.Favorite;
import com.example.fasomarket.model.User;
import com.example.fasomarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
    Optional<Favorite> findByUserAndProduct(User user, Product product);
    boolean existsByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
    
    // Méthodes par userId
    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId ORDER BY f.createdAt DESC")
    List<Favorite> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
    
    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId AND f.product.id = :productId")
    Optional<Favorite> findByUserIdAndProductId(@Param("userId") UUID userId, @Param("productId") UUID productId);
}