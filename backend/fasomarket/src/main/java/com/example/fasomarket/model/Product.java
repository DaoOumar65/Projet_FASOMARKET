package com.example.fasomarket.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@JsonIgnoreProperties({"shop", "categoryEntity"})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category categoryEntity;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    @Column(name = "sku")
    private String sku;

    @Column(name = "weight", precision = 8, scale = 3)
    private BigDecimal weight;

    @Column(name = "dimensions")
    private String dimensions;

    @Column(name = "color")
    private String color;

    @Column(name = "brand")
    private String brand;

    @Column(name = "material")
    private String material;

    @Column(name = "size")
    private String size;

    @Column(name = "sizes", columnDefinition = "TEXT")
    private String sizes; // JSON array: ["S", "M", "L", "XL"]

    @Column(name = "colors", columnDefinition = "TEXT")
    private String colors; // JSON array: ["Rouge", "Bleu"]

    @Column(name = "origin")
    private String origin;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    @Column(name = "discount", precision = 5, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "reviews_count")
    private Integer reviewsCount = 0;

    @Column(name = "available", nullable = false)
    private Boolean available = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "min_order_quantity")
    private Integer minOrderQuantity = 1;

    @Column(name = "max_order_quantity")
    private Integer maxOrderQuantity;

    @Column(name = "warranty_period")
    private String warrantyPeriod;

    @Column(name = "return_policy")
    private String returnPolicy;

    @Column(name = "shipping_weight", precision = 8, scale = 3)
    private BigDecimal shippingWeight;

    @Column(name = "shipping_dimensions")
    private String shippingDimensions;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description")
    private String metaDescription;

    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "featured", nullable = false)
    private Boolean featured = false;

    @Column(name = "views_count")
    private Long viewsCount = 0L;

    @Column(name = "sales_count")
    private Long salesCount = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructeurs
    public Product() {}

    public Product(Shop shop, String name, String description, String category, BigDecimal price, Integer stockQuantity) {
        this.shop = shop;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.sku = generateSku();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.available = this.stockQuantity > 0 && this.isActive;
    }

    @PrePersist
    public void prePersist() {
        if (this.sku == null || this.sku.isEmpty()) {
            this.sku = generateSku();
        }
        this.available = this.stockQuantity > 0 && this.isActive;
    }

    private String generateSku() {
        return "PRD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Shop getShop() { return shop; }
    public void setShop(Shop shop) { this.shop = shop; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Category getCategoryEntity() { return categoryEntity; }
    public void setCategoryEntity(Category categoryEntity) { this.categoryEntity = categoryEntity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { 
        this.stockQuantity = stockQuantity;
        this.available = stockQuantity > 0 && this.isActive;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { 
        this.isActive = isActive;
        this.available = this.stockQuantity > 0 && isActive;
    }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getSizes() { return sizes; }
    public void setSizes(String sizes) { this.sizes = sizes; }

    public String getColors() { return colors; }
    public void setColors(String colors) { this.colors = colors; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public Integer getMinOrderQuantity() { return minOrderQuantity; }
    public void setMinOrderQuantity(Integer minOrderQuantity) { this.minOrderQuantity = minOrderQuantity; }

    public Integer getMaxOrderQuantity() { return maxOrderQuantity; }
    public void setMaxOrderQuantity(Integer maxOrderQuantity) { this.maxOrderQuantity = maxOrderQuantity; }

    public String getWarrantyPeriod() { return warrantyPeriod; }
    public void setWarrantyPeriod(String warrantyPeriod) { this.warrantyPeriod = warrantyPeriod; }

    public String getReturnPolicy() { return returnPolicy; }
    public void setReturnPolicy(String returnPolicy) { this.returnPolicy = returnPolicy; }

    public BigDecimal getShippingWeight() { return shippingWeight; }
    public void setShippingWeight(BigDecimal shippingWeight) { this.shippingWeight = shippingWeight; }

    public String getShippingDimensions() { return shippingDimensions; }
    public void setShippingDimensions(String shippingDimensions) { this.shippingDimensions = shippingDimensions; }

    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getMetaKeywords() { return metaKeywords; }
    public void setMetaKeywords(String metaKeywords) { this.metaKeywords = metaKeywords; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Long getViewsCount() { return viewsCount; }
    public void setViewsCount(Long viewsCount) { this.viewsCount = viewsCount; }

    public Long getSalesCount() { return salesCount; }
    public void setSalesCount(Long salesCount) { this.salesCount = salesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Méthodes utilitaires
    public BigDecimal getPriceWithDiscount() {
        if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
            return price.subtract(price.multiply(discount.divide(BigDecimal.valueOf(100))));
        }
        return price;
    }

    public boolean isInStock() {
        return stockQuantity > 0;
    }

    public boolean isLowStock() {
        return stockQuantity <= 5 && stockQuantity > 0;
    }

    public void incrementViews() {
        this.viewsCount++;
    }

    public void incrementSales() {
        this.salesCount++;
    }
}