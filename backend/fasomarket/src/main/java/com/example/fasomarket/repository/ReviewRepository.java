package com.example.fasomarket.repository;

import com.example.fasomarket.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.utilisateur WHERE r.produitId = :produitId AND r.modere = true ORDER BY r.dateCreation DESC")
    List<Review> findByProduitIdAndModereTrue(@Param("produitId") String produitId);

    @Query("SELECT r FROM Review r WHERE r.modere = false ORDER BY r.dateCreation DESC")
    List<Review> findByModereFalse();

    @Query("SELECT r FROM Review r WHERE r.signale = true ORDER BY r.dateCreation DESC")
    List<Review> findBySignaleTrue();

    List<Review> findByUtilisateurId(String utilisateurId);
}