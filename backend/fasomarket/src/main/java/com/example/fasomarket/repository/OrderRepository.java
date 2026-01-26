package com.example.fasomarket.repository;

import com.example.fasomarket.model.Order;
import com.example.fasomarket.model.User;
import com.example.fasomarket.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByClient(User client);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByClientOrderByCreatedAtDesc(User client);
    List<Order> findByTotalAmount(BigDecimal totalAmount);
    
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.client " +
           "JOIN FETCH o.orderItems oi " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH p.shop s " +
           "WHERE s.vendor.user = :vendor " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersByVendor(@Param("vendor") User vendor);
    
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.client " +
           "JOIN FETCH o.orderItems oi " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH p.shop s " +
           "WHERE s.vendor.user = :vendor AND o.status = :status " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersByVendorAndStatus(@Param("vendor") User vendor, @Param("status") OrderStatus status);
    
    // Méthodes pour dashboard client
    @Query("SELECT COUNT(o) FROM Order o WHERE o.client.id = :clientId AND o.status IN :statuses")
    Long countByClientIdAndStatusIn(@Param("clientId") UUID clientId, @Param("statuses") List<OrderStatus> statuses);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.client.id = :clientId AND o.status = :status")
    Long countByClientIdAndStatus(@Param("clientId") UUID clientId, @Param("status") OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.client.id = :clientId")
    Double sumTotalAmountByClientId(@Param("clientId") UUID clientId);
    
    @Query("SELECT o FROM Order o WHERE o.client.id = :clientId ORDER BY o.createdAt DESC LIMIT 5")
    List<Order> findTop5ByClientIdOrderByCreatedAtDesc(@Param("clientId") UUID clientId);
    
    @Query("SELECT o FROM Order o WHERE o.client.id = :clientId ORDER BY o.createdAt DESC")
    List<Order> findByClientIdOrderByCreatedAtDesc(@Param("clientId") UUID clientId);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product LEFT JOIN FETCH o.client WHERE o.id = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") UUID orderId);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product WHERE o.client.id = :clientId ORDER BY o.createdAt DESC")
    List<Order> findByClientIdWithDetailsOrderByCreatedAtDesc(@Param("clientId") UUID clientId);
    
    long countByStatus(OrderStatus status);
}