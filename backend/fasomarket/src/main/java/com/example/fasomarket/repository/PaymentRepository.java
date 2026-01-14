package com.example.fasomarket.repository;

import com.example.fasomarket.model.Payment;
import com.example.fasomarket.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByOrder(Order order);
}