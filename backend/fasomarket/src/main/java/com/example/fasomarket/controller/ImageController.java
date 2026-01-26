package com.example.fasomarket.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/produits").resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(resource);
            }
        } catch (Exception e) {
            // Fallback to default image
        }
        
        // Return default image
        try {
            Path defaultPath = Paths.get("uploads/default-product.jpg");
            Resource defaultResource = new UrlResource(defaultPath.toUri());
            
            if (defaultResource.exists()) {
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(defaultResource);
            }
        } catch (Exception e) {
            // Return 404 if default image also not found
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/default-product.jpg")
    public ResponseEntity<Resource> getDefaultImage() {
        return getImage("default-product.jpg");
    }
}