package com.example.fasomarket.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PanierItemResponse {
    private UUID id;
    private UUID produitId;
    private String nomProduit;
    private String nomBoutique;
    private BigDecimal prixUnitaire;
    private Integer quantite;
    private BigDecimal prixTotal;
    private List<String> imagesProduit;
    private Boolean disponible;
    private LocalDateTime dateAjout;
    
    // Options sélectionnées
    private String couleurSelectionnee;
    private String tailleSelectionnee;
    private String modeleSelectionne;
    private String optionsPersonnalisees;

    public PanierItemResponse() {}

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProduitId() { return produitId; }
    public void setProduitId(UUID produitId) { this.produitId = produitId; }

    public String getNomProduit() { return nomProduit; }
    public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }

    public String getNomBoutique() { return nomBoutique; }
    public void setNomBoutique(String nomBoutique) { this.nomBoutique = nomBoutique; }

    public BigDecimal getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(BigDecimal prixUnitaire) { this.prixUnitaire = prixUnitaire; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public BigDecimal getPrixTotal() { return prixTotal; }
    public void setPrixTotal(BigDecimal prixTotal) { this.prixTotal = prixTotal; }

    public List<String> getImagesProduit() { return imagesProduit; }
    public void setImagesProduit(List<String> imagesProduit) { this.imagesProduit = imagesProduit; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public LocalDateTime getDateAjout() { return dateAjout; }
    public void setDateAjout(LocalDateTime dateAjout) { this.dateAjout = dateAjout; }

    public String getCouleurSelectionnee() { return couleurSelectionnee; }
    public void setCouleurSelectionnee(String couleurSelectionnee) { this.couleurSelectionnee = couleurSelectionnee; }

    public String getTailleSelectionnee() { return tailleSelectionnee; }
    public void setTailleSelectionnee(String tailleSelectionnee) { this.tailleSelectionnee = tailleSelectionnee; }

    public String getModeleSelectionne() { return modeleSelectionne; }
    public void setModeleSelectionne(String modeleSelectionne) { this.modeleSelectionne = modeleSelectionne; }

    public String getOptionsPersonnalisees() { return optionsPersonnalisees; }
    public void setOptionsPersonnalisees(String optionsPersonnalisees) { this.optionsPersonnalisees = optionsPersonnalisees; }
}