package com.example.fasomarket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendors")
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VendorStatus status = VendorStatus.EN_ATTENTE_VALIDATION;

    @Column(name = "id_card")
    private String idCard;

    @Column(name = "document_identite_url")
    private String documentIdentiteUrl;

    @Column(name = "date_validation_compte")
    private LocalDateTime dateValidationCompte;

    @Column(name = "raison_refus")
    private String raisonRefus;

    @Column(name = "valide_par_admin_id")
    private UUID valideParAdminId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructeurs
    public Vendor() {}

    public Vendor(User user, String idCard) {
        this.user = user;
        this.idCard = idCard;
    }

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public VendorStatus getStatus() { return status; }
    public void setStatus(VendorStatus status) { this.status = status; }

    public String getIdCard() { return idCard; }
    public void setIdCard(String idCard) { this.idCard = idCard; }

    public String getDocumentIdentiteUrl() { return documentIdentiteUrl; }
    public void setDocumentIdentiteUrl(String documentIdentiteUrl) { this.documentIdentiteUrl = documentIdentiteUrl; }

    public LocalDateTime getDateValidationCompte() { return dateValidationCompte; }
    public void setDateValidationCompte(LocalDateTime dateValidationCompte) { this.dateValidationCompte = dateValidationCompte; }

    public String getRaisonRefus() { return raisonRefus; }
    public void setRaisonRefus(String raisonRefus) { this.raisonRefus = raisonRefus; }

    public UUID getValideParAdminId() { return valideParAdminId; }
    public void setValideParAdminId(UUID valideParAdminId) { this.valideParAdminId = valideParAdminId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}