package com.example.fasomarket.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {
    private UUID id;
    private String titre;
    private String message;
    private String type;
    private Boolean estLue;
    private UUID referenceId;
    private LocalDateTime dateCreation;

    // Constructeurs
    public NotificationResponse() {}

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Boolean getEstLue() { return estLue; }
    public void setEstLue(Boolean estLue) { this.estLue = estLue; }

    public UUID getReferenceId() { return referenceId; }
    public void setReferenceId(UUID referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}