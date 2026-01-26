package com.example.fasomarket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImageUrlService {
    
    @Value("${server.port:8081}")
    private String serverPort;
    
    public String buildImageUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        
        // Si l'URL est déjà complète, la retourner telle quelle
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }
        
        // Construire l'URL complète
        String baseUrl = "http://localhost:" + serverPort;
        
        // Ajouter /uploads/ si ce n'est pas déjà présent
        if (!imagePath.startsWith("/uploads/")) {
            if (imagePath.startsWith("uploads/")) {
                imagePath = "/" + imagePath;
            } else {
                imagePath = "/uploads/produits/" + imagePath;
            }
        }
        
        return baseUrl + imagePath;
    }
    
    public List<String> buildImagesArray(String images) {
        if (images == null || images.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        String[] imageArray = images.split(",");
        List<String> result = new ArrayList<>();
        
        for (String image : imageArray) {
            String imageUrl = buildImageUrl(image.trim());
            if (imageUrl != null) {
                result.add(imageUrl);
            }
        }
        
        return result;
    }
}