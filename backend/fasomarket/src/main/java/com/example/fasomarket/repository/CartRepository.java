package com.example.fasomarket.repository;

import com.example.fasomarket.model.Cart;
import com.example.fasomarket.model.User;
import com.example.fasomarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    List<Cart> findByClient(User client);
    Optional<Cart> findByClientAndProduct(User client, Product product);
    
    @Transactional
    void deleteByClient(User client);
}