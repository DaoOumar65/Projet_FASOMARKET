package com.example.fasomarket.controller;

import com.example.fasomarket.dto.NotificationResponse;
import com.example.fasomarket.model.Notification;
import com.example.fasomarket.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Gestion des notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Mes notifications", description = "Récupère toutes les notifications de l'utilisateur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des notifications"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> obtenirNotifications(@RequestHeader("X-User-Id") UUID userId) {
        try {
            List<NotificationResponse> notifications = notificationService.obtenirNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/non-lues")
    @Operation(summary = "Notifications non lues", description = "Récupère les notifications non lues")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notifications non lues")
    })
    public ResponseEntity<?> obtenirNotificationsNonLues(@RequestHeader("X-User-Id") UUID userId) {
        try {
            List<NotificationResponse> notifications = notificationService.obtenirNotificationsNonLues(userId);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/compteur")
    @Operation(summary = "Compteur notifications", description = "Nombre de notifications non lues")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Nombre de notifications non lues")
    })
    public ResponseEntity<?> compterNotificationsNonLues(@RequestHeader("X-User-Id") UUID userId) {
        try {
            long count = notificationService.compterNotificationsNonLues(userId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{notificationId}/lue")
    @Operation(summary = "Marquer comme lue", description = "Marque une notification comme lue")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification marquée comme lue")
    })
    public ResponseEntity<?> marquerCommeLue(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID notificationId) {
        try {
            notificationService.marquerCommeLue(userId, notificationId);
            return ResponseEntity.ok("Notification marquée comme lue");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/toutes-lues")
    @Operation(summary = "Marquer toutes comme lues", description = "Marque toutes les notifications comme lues")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Toutes les notifications marquées comme lues")
    })
    public ResponseEntity<?> marquerToutesCommeLues(@RequestHeader("X-User-Id") UUID userId) {
        try {
            notificationService.marquerToutesCommeLues(userId);
            return ResponseEntity.ok("Toutes les notifications marquées comme lues");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}