package com.example.fasomarket.repository;

import com.example.fasomarket.model.Address;
import com.example.fasomarket.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByUserOrderByParDefautDescNomAsc(User user);
    Optional<Address> findByUserAndParDefautTrue(User user);
    
    // Méthodes par userId
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId ORDER BY a.parDefaut DESC, a.id DESC")
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(@Param("userId") UUID userId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.parDefaut = true")
    List<Address> findByUserIdAndIsDefaultTrue(@Param("userId") UUID userId);
    
    @Query("SELECT a FROM Address a WHERE a.id = :id AND a.user.id = :userId")
    Optional<Address> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}