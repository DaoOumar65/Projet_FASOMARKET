package com.example.fasomarket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class StockDTO {
    private UUID id;
    @JsonProperty("nom")
    private String name;
    @JsonProperty("prix")
    private BigDecimal price;
    @JsonProperty("quantiteStock")
    private Integer stockQuantity;
    @JsonProperty("seuilAlerte")
    private Integer alertThreshold;
    private String images;
    @JsonProperty("disponible")
    private Boolean available;
    private String statut;
    @JsonProperty("dateModification")
    private LocalDateTime updatedAt;
    @JsonProperty("categorie")
    private String category;
    @JsonProperty("nombreVentes")
    private Integer salesCount;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Integer getAlertThreshold() { return alertThreshold; }
    public void setAlertThreshold(Integer alertThreshold) { this.alertThreshold = alertThreshold; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getSalesCount() { return salesCount; }
    public void setSalesCount(Integer salesCount) { this.salesCount = salesCount; }
}
