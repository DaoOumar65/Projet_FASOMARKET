package com.example.fasomarket.repository;

import com.example.fasomarket.model.Vendor;
import com.example.fasomarket.model.VendorStatus;
import com.example.fasomarket.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Optional<Vendor> findByUser(User user);
    Optional<Vendor> findByUserId(UUID userId);
    
    @Query("SELECT v FROM Vendor v JOIN FETCH v.user WHERE v.status = :status")
    List<Vendor> findByStatus(VendorStatus status);
    
    long countByStatus(VendorStatus status);
}