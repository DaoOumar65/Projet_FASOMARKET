package com.example.fasomarket.repository;

import com.example.fasomarket.model.ProduitVariante;
import com.example.fasomarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProduitVarianteRepository extends JpaRepository<ProduitVariante, Long> {
    List<ProduitVariante> findByProduitId(String produitId);
    List<ProduitVariante> findByProduit_Id(UUID produitId);
    List<ProduitVariante> findByProduit(Product produit);
    boolean existsBySku(String sku);
    long countByProduitId(UUID produitId);
}