package com.example.fasomarket.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ProductPublicDTO {
    private UUID id;
    @JsonProperty("nom")
    private String name;
    private String description;
    @JsonProperty("prix")
    private BigDecimal price;
    @JsonProperty("quantiteStock")
    private Integer stockQuantity;
    @JsonProperty("categorie")
    private String category;
    private String images;
    private String status;
    @JsonProperty("disponible")
    private Boolean available;
    private Boolean featured;
    private BigDecimal discount;
    private Double rating;
    @JsonProperty("nombreAvis")
    private Integer reviewsCount;
    @JsonProperty("quantiteMinCommande")
    private Integer minOrderQuantity;
    @JsonProperty("nombreVentes")
    private Integer salesCount;
    @JsonProperty("nombreVues")
    private Integer viewsCount;
    @JsonProperty("dateCreation")
    private LocalDateTime createdAt;
    @JsonProperty("boutiqueId")
    private UUID shopId;
    @JsonProperty("boutiqueNom")
    private String shopName;
    @JsonProperty("boutiqueLogo")
    private String shopLogoUrl;
    @JsonProperty("vendeurId")
    private UUID vendorUserId;
    @JsonProperty("vendeurNom")
    private String vendorName;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public Integer getMinOrderQuantity() {
        return minOrderQuantity;
    }

    public void setMinOrderQuantity(Integer minOrderQuantity) {
        this.minOrderQuantity = minOrderQuantity;
    }

    public Integer getSalesCount() {
        return salesCount;
    }

    public void setSalesCount(Integer salesCount) {
        this.salesCount = salesCount;
    }

    public Integer getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Integer viewsCount) {
        this.viewsCount = viewsCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UUID getShopId() {
        return shopId;
    }

    public void setShopId(UUID shopId) {
        this.shopId = shopId;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getShopLogoUrl() {
        return shopLogoUrl;
    }

    public void setShopLogoUrl(String shopLogoUrl) {
        this.shopLogoUrl = shopLogoUrl;
    }

    public UUID getVendorUserId() {
        return vendorUserId;
    }

    public void setVendorUserId(UUID vendorUserId) {
        this.vendorUserId = vendorUserId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }
}
