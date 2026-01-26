package com.example.fasomarket.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shops")
@JsonIgnoreProperties({"vendor", "categoryEntity"})
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category categoryEntity;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "email")
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "address", nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ShopStatus status = ShopStatus.EN_ATTENTE_APPROBATION;

    @Column(name = "category")
    private String category; // Garder pour compatibilité

    // Documents de validation
    @Column(name = "numero_cnib")
    private String numeroCnib;

    @Column(name = "fichier_ifu")
    private String fichierIfu;

    @Column(name = "registre_commerce_url")
    private String registreCommerceUrl;

    @Column(name = "patente_url")
    private String patenteUrl;

    @Column(name = "photos_boutique", columnDefinition = "TEXT")
    private String photosBoutique; // JSON array des URLs

    // Validation tracking
    @Column(name = "date_soumission")
    private LocalDateTime dateSoumission;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "raison_rejet")
    private String raisonRejet;

    @Column(name = "valide_par_admin_id")
    private UUID valideParAdminId;

    @Column(name = "opening_hours", columnDefinition = "TEXT")
    private String openingHours; // JSON string

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "reviews_count")
    private Integer reviewsCount = 0;

    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinks; // JSON string

    @Column(name = "delivery")
    private Boolean delivery = false;

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array as string

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructeurs
    public Shop() {}

    public Shop(Vendor vendor, String name, String description, String phone, String address) {
        this.vendor = vendor;
        this.name = name;
        this.description = description;
        this.phone = phone;
        this.address = address;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters et Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public ShopStatus getStatus() { return status; }
    public void setStatus(ShopStatus status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Category getCategoryEntity() { return categoryEntity; }
    public void setCategoryEntity(Category categoryEntity) { this.categoryEntity = categoryEntity; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getSocialLinks() { return socialLinks; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }

    public Boolean getDelivery() { return delivery; }
    public void setDelivery(Boolean delivery) { this.delivery = delivery; }

    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Nouveaux getters/setters
    public String getRegistreCommerceUrl() { return registreCommerceUrl; }
    public void setRegistreCommerceUrl(String registreCommerceUrl) { this.registreCommerceUrl = registreCommerceUrl; }

    public String getPatenteUrl() { return patenteUrl; }
    public void setPatenteUrl(String patenteUrl) { this.patenteUrl = patenteUrl; }

    public String getPhotosBoutique() { return photosBoutique; }
    public void setPhotosBoutique(String photosBoutique) { this.photosBoutique = photosBoutique; }

    public LocalDateTime getDateSoumission() { return dateSoumission; }
    public void setDateSoumission(LocalDateTime dateSoumission) { this.dateSoumission = dateSoumission; }

    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }

    public String getRaisonRejet() { return raisonRejet; }
    public void setRaisonRejet(String raisonRejet) { this.raisonRejet = raisonRejet; }

    public UUID getValideParAdminId() { return valideParAdminId; }
    public void setValideParAdminId(UUID valideParAdminId) { this.valideParAdminId = valideParAdminId; }

    public String getNumeroCnib() { return numeroCnib; }
    public void setNumeroCnib(String numeroCnib) { this.numeroCnib = numeroCnib; }

    public String getFichierIfu() { return fichierIfu; }
    public void setFichierIfu(String fichierIfu) { this.fichierIfu = fichierIfu; }
}