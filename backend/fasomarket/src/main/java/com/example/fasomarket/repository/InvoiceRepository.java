package com.example.fasomarket.repository;

import com.example.fasomarket.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    boolean existsByOrderId(UUID orderId);
    
    Optional<Invoice> findByOrderId(UUID orderId);
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}