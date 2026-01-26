package com.example.fasomarket.repository;

import com.example.fasomarket.model.ProduitVariante;
import com.example.fasomarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProduitVarianteRepository extends JpaRepository<ProduitVariante, Long> {
    List<ProduitVariante> findByProduit(Product produit);
    List<ProduitVariante> findByProduitId(Long produitId);
    boolean existsBySku(String sku);
}