package com.example.fasomarket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class GeocodingService {

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Double> geocodeAddress(String address) {
        if (googleMapsApiKey == null || googleMapsApiKey.isEmpty()) {
            // Mode simulation sans API key
            return Map.of("latitude", 12.3714, "longitude", -1.5197); // Ouagadougou par défaut
        }

        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s",
                URLEncoder.encode(address + ", Burkina Faso", StandardCharsets.UTF_8),
                googleMapsApiKey
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "OK".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                var results = (java.util.List<Map<String, Object>>) response.get("results");
                if (!results.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    var geometry = (Map<String, Object>) results.get(0).get("geometry");
                    @SuppressWarnings("unchecked")
                    var location = (Map<String, Double>) geometry.get("location");
                    
                    return Map.of(
                        "latitude", location.get("lat"),
                        "longitude", location.get("lng")
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur géocodage: " + e.getMessage());
        }

        return null;
    }
}
