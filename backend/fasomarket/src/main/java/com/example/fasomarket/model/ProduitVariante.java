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
    
    private String couleur;
    private String taille;
    private String modele;
    private String capacite;
    private String puissance;
    private Double prixAjustement = 0.0;
    private Integer stock = 0;
    private String sku;
    private BigDecimal poids;
    private String dimensions;
    private String materiau;
    private String finition;
    private String parfum;
    private String ageCible;
    private String genre;
    private String saison;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Constructeurs
    public ProduitVariante() {}
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
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
    
    public String getCapacite() { return capacite; }
    public void setCapacite(String capacite) { this.capacite = capacite; }
    
    public String getPuissance() { return puissance; }
    public void setPuissance(String puissance) { this.puissance = puissance; }
    
    public Double getPrixAjustement() { return prixAjustement; }
    public void setPrixAjustement(Double prixAjustement) { this.prixAjustement = prixAjustement; }
    
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    
    public BigDecimal getPoids() { return poids; }
    public void setPoids(BigDecimal poids) { this.poids = poids; }
    
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    
    public String getMateriau() { return materiau; }
    public void setMateriau(String materiau) { this.materiau = materiau; }
    
    public String getFinition() { return finition; }
    public void setFinition(String finition) { this.finition = finition; }
    
    public String getParfum() { return parfum; }
    public void setParfum(String parfum) { this.parfum = parfum; }
    
    public String getAgeCible() { return ageCible; }
    public void setAgeCible(String ageCible) { this.ageCible = ageCible; }
    
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    
    public String getSaison() { return saison; }
    public void setSaison(String saison) { this.saison = saison; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}