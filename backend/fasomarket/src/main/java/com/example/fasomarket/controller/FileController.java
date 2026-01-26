package com.example.fasomarket.controller;

import com.example.fasomarket.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Gestion Fichiers", description = "Upload et gestion des fichiers")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload-ifu")
    @Operation(summary = "Upload fichier IFU", description = "Upload d'un fichier IFU (PDF, JPG, PNG)")
    public ResponseEntity<?> uploadIfuFile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String filePath = fileService.saveIfuFile(file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "filePath", filePath,
                "message", "Fichier IFU uploadé avec succès"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/upload-shop-image")
    @Operation(summary = "Upload image boutique", description = "Upload d'une image pour boutique (JPG, PNG)")
    public ResponseEntity<?> uploadShopImage(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileService.saveShopImage(file, "shop_" + userId);
            String filePath = "/api/files/shops/" + fileName;
            return ResponseEntity.ok(Map.of(
                "success", true,
                "filePath", filePath,
                "message", "Image boutique uploadée avec succès"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/shops/{filename}")
    @Operation(summary = "Servir image boutique", description = "Sert une image de boutique")
    public ResponseEntity<Resource> serveShopImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/shops").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg";
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}