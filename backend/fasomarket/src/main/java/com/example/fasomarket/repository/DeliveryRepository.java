package com.example.fasomarket.repository;

import com.example.fasomarket.model.Delivery;
import com.example.fasomarket.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    Optional<Delivery> findByOrder(Order order);
}