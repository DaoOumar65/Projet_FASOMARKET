package com.example.fasomarket.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String[] ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"};
    private static final String[] IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"};
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public String saveIfuFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier IFU est obligatoire");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Le fichier IFU ne peut pas dépasser 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isValidFileType(originalFilename)) {
            throw new RuntimeException("Format de fichier non supporté. Utilisez PDF, JPG, JPEG ou PNG");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR, "ifu");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFilename);

        Files.copy(file.getInputStream(), filePath);
        return "uploads/ifu/" + uniqueFilename;
    }

    public String saveShopImage(MultipartFile file, String prefix) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("L'image est obligatoire");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("L'image ne peut pas dépasser 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isValidImageType(originalFilename)) {
            throw new RuntimeException("Format d'image non supporté. Utilisez JPG, JPEG ou PNG");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR, "shops");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = prefix + "_" + System.currentTimeMillis() + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFilename);

        Files.copy(file.getInputStream(), filePath);
        return uniqueFilename;
    }

    private boolean isValidFileType(String filename) {
        String lowerFilename = filename.toLowerCase();
        for (String extension : ALLOWED_EXTENSIONS) {
            if (lowerFilename.endsWith(extension)) {
                return true;
            }
        }
        return false;
    }

    private boolean isValidImageType(String filename) {
        String lowerFilename = filename.toLowerCase();
        for (String extension : IMAGE_EXTENSIONS) {
            if (lowerFilename.endsWith(extension)) {
                return true;
            }
        }
        return false;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log l'erreur mais ne pas faire échouer l'opération
            System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
        }
    }
}