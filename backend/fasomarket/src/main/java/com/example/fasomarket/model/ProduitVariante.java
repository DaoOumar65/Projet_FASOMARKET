package com.example.fasomarket.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produit_variantes")
public class ProduitVariante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Product produit;
    
    @Column(name = "couleur")
    private String couleur;
    
    @Column(name = "taille")
    private String taille;
    
    @Column(name = "modele")
    private String modele;
    
    @Column(name = "prix_ajustement", precision = 10, scale = 2)
    private BigDecimal prixAjustement = BigDecimal.ZERO;
    
    @Column(name = "stock")
    private Integer stock = 0;
    
    @Column(name = "sku", unique = true)
    private String sku;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Constructeurs
    public ProduitVariante() {}
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Product getProduit() { return produit; }
    public void setProduit(Product produit) { this.produit = produit; }
    
    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }
    
    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }
    
    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }
    
    public BigDecimal getPrixAjustement() { return prixAjustement; }
    public void setPrixAjustement(BigDecimal prixAjustement) { this.prixAjustement = prixAjustement; }
    
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}