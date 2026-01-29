package com.example.fasomarket.dto;

import java.util.Map;
import java.util.UUID;

public class AjouterPanierRequest {
    private UUID produitId;
    private Integer quantite;
    private String couleurSelectionnee;
    private String tailleSelectionnee;
    private String modeleSelectionne;
    private Long varianteId;
    private Map<String, String> optionsPersonnalisees;

    public AjouterPanierRequest() {}

    // Getters et Setters
    public UUID getProduitId() { return produitId; }
    public void setProduitId(UUID produitId) { this.produitId = produitId; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public String getCouleurSelectionnee() { return couleurSelectionnee; }
    public void setCouleurSelectionnee(String couleurSelectionnee) { this.couleurSelectionnee = couleurSelectionnee; }

    public String getTailleSelectionnee() { return tailleSelectionnee; }
    public void setTailleSelectionnee(String tailleSelectionnee) { this.tailleSelectionnee = tailleSelectionnee; }

    public String getModeleSelectionne() { return modeleSelectionne; }
    public void setModeleSelectionne(String modeleSelectionne) { this.modeleSelectionne = modeleSelectionne; }

    public Long getVarianteId() { return varianteId; }
    public void setVarianteId(Long varianteId) { this.varianteId = varianteId; }

    public Map<String, String> getOptionsPersonnalisees() { return optionsPersonnalisees; }
    public void setOptionsPersonnalisees(Map<String, String> optionsPersonnalisees) { this.optionsPersonnalisees = optionsPersonnalisees; }
}