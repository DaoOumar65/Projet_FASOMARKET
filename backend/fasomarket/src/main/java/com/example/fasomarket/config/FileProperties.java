package com.example.fasomarket.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "file")
public class FileProperties {
    private String uploadDir;
    private String shopImagesDir;

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public String getShopImagesDir() {
        return shopImagesDir;
    }

    public void setShopImagesDir(String shopImagesDir) {
        this.shopImagesDir = shopImagesDir;
    }
}