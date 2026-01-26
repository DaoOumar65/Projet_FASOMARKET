package com.example.fasomarket.repository;

import com.example.fasomarket.model.Shop;
import com.example.fasomarket.model.ShopStatus;
import com.example.fasomarket.model.Vendor;
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
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    List<Shop> findByVendor(Vendor vendor);
    boolean existsByVendor(Vendor vendor);
    
    @Query("SELECT s FROM Shop s JOIN FETCH s.vendor v JOIN FETCH v.user WHERE s.status = :status")
    List<Shop> findByStatus(ShopStatus status);
    
    Page<Shop> findByStatus(ShopStatus status, Pageable pageable);
    Optional<Shop> findByIdAndStatus(UUID id, ShopStatus status);
    Optional<Shop> findByName(String name);
    boolean existsByName(String name);
    List<Shop> findByStatusAndCategoryContainingIgnoreCase(ShopStatus status, String category);
    List<Shop> findByStatusAndNameContainingIgnoreCase(ShopStatus status, String name);
    List<Shop> findByStatusAndNameContainingIgnoreCaseAndCategoryContainingIgnoreCase(ShopStatus status, String name, String category);
    List<Shop> findByStatusAndCategoryEntity(ShopStatus status, Category category);
    long countByStatus(ShopStatus status);
    long countByStatusAndCategory(ShopStatus status, String category);
}