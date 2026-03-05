package com.example.fasomarket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "produit_id", nullable = false)
    private String produitId;

    @Column(name = "utilisateur_id", nullable = false)
    private String utilisateurId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", insertable = false, updatable = false)
    private User utilisateur;

    @Column(nullable = false)
    private Integer note;

    @Column(length = 100)
    private String titre;

    @Column(length = 500)
    private String commentaire;

    @Column(nullable = false)
    private Boolean recommande = true;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "votes_utiles")
    private Integer votesUtiles = 0;

    @Column(name = "votes_inutiles")
    private Integer votesInutiles = 0;

    @Column(nullable = false)
    private Boolean modere = true;

    @Column(nullable = false)
    private Boolean signale = false;

    @Column(name = "reponse_vendeur", length = 500)
    private String reponseVendeur;

    @Column(name = "raison_rejet", length = 200)
    private String raisonRejet;

    // Constructors
    public Review() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getProduitId() { return produitId; }
    public void setProduitId(String produitId) { this.produitId = produitId; }

    public String getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(String utilisateurId) { this.utilisateurId = utilisateurId; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public Boolean getRecommande() { return recommande; }
    public void setRecommande(Boolean recommande) { this.recommande = recommande; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Integer getVotesUtiles() { return votesUtiles; }
    public void setVotesUtiles(Integer votesUtiles) { this.votesUtiles = votesUtiles; }

    public Integer getVotesInutiles() { return votesInutiles; }
    public void setVotesInutiles(Integer votesInutiles) { this.votesInutiles = votesInutiles; }

    public Boolean getModere() { return modere; }
    public void setModere(Boolean modere) { this.modere = modere; }

    public Boolean getSignale() { return signale; }
    public void setSignale(Boolean signale) { this.signale = signale; }

    public String getReponseVendeur() { return reponseVendeur; }
    public void setReponseVendeur(String reponseVendeur) { this.reponseVendeur = reponseVendeur; }

    public String getRaisonRejet() { return raisonRejet; }
    public void setRaisonRejet(String raisonRejet) { this.raisonRejet = raisonRejet; }
}