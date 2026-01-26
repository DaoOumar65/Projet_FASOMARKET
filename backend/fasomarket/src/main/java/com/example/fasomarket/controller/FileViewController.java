package com.example.fasomarket.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileViewController {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @GetMapping("/view/{filename}")
    public ResponseEntity<Resource> viewFile(@PathVariable String filename) {
        try {
            // Extraire seulement le nom du fichier si le chemin complet est fourni
            String actualFilename = filename;
            if (filename.contains("/")) {
                actualFilename = filename.substring(filename.lastIndexOf("/") + 1);
            }
            // Déterminer le sous-dossier (ifu ou shops)
            Path filePath;
            if (filename.contains("ifu") || actualFilename.endsWith(".pdf")) {
                filePath = Paths.get(uploadDir, "ifu", actualFilename).normalize();
            } else {
                filePath = Paths.get(uploadDir, "shops", actualFilename).normalize();
            }
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                
                if (actualFilename.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (actualFilename.toLowerCase().matches(".*\\.(jpg|jpeg|png|gif)$")) {
                    contentType = "image/" + actualFilename.substring(actualFilename.lastIndexOf('.') + 1);
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + actualFilename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}