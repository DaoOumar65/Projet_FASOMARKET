package com.example.fasomarket.dto;

import java.math.BigDecimal;

public class ArticleCommandeDTO {
    private String id;
    private String nomProduit;
    private Integer quantite;
    private BigDecimal prixUnitaire;
    private BigDecimal prixTotal;
    private String nomBoutique;
    
    // Infos variante
    private Long varianteId;
    private String couleurSelectionnee;
    private String tailleSelectionnee;
    private String modeleSelectionne;
    private String varianteInfo; // Description lisible de la variante

    public ArticleCommandeDTO() {}

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNomProduit() { return nomProduit; }
    public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }

    public BigDecimal getPrixTotal() { return prixTotal; }
    public void setPrixTotal(BigDecimal prixTotal) { this.prixTotal = prixTotal; }

    public String getNomBoutique() { return nomBoutique; }
    public void setNomBoutique(String nomBoutique) { this.nomBoutique = nomBoutique; }

    public Long getVarianteId() { return varianteId; }
    public void setVarianteId(Long varianteId) { this.varianteId = varianteId; }

    public String getCouleurSelectionnee() { return couleurSelectionnee; }
    public void setCouleurSelectionnee(String couleurSelectionnee) { this.couleurSelectionnee = couleurSelectionnee; }

    public String getTailleSelectionnee() { return tailleSelectionnee; }
    public void setTailleSelectionnee(String tailleSelectionnee) { this.tailleSelectionnee = tailleSelectionnee; }

    public String getModeleSelectionne() { return modeleSelectionne; }
    public void setModeleSelectionne(String modeleSelectionne) { this.modeleSelectionne = modeleSelectionne; }

    public String getVarianteInfo() { return varianteInfo; }
    public void setVarianteInfo(String varianteInfo) { this.varianteInfo = varianteInfo; }
}