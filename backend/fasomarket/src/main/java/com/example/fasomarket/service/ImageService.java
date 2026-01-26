package com.example.fasomarket.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {
    
    private static final String UPLOAD_DIR = "uploads/";
    
    public String uploadImage(MultipartFile file, String type) throws IOException {
        String folder = UPLOAD_DIR + type + "/";
        Path uploadPath = Paths.get(folder);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        return "/" + folder + filename;
    }
}
