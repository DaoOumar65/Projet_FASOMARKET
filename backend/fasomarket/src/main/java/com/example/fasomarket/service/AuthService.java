package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import com.example.fasomarket.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    public AuthResponse connexion(ConnexionRequest request) {
        User user = userRepository.findByPhone(request.getTelephone())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Compte désactivé");
        }

        // Vérification spéciale pour les vendeurs
        if (user.getRole().equals(Role.VENDOR)) {
            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Profil vendeur non trouvé"));
            
            if (vendor.getStatus().equals(VendorStatus.EN_ATTENTE_VALIDATION)) {
                throw new RuntimeException("Votre compte vendeur est en attente d'approbation par l'administrateur");
            }
            
            if (vendor.getStatus().equals(VendorStatus.REFUSE)) {
                throw new RuntimeException("Votre compte vendeur a été rejeté. Contactez l'administration");
            }
        }

        String token = jwtService.generateToken(user.getId(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getIsVerified()
        );
    }

    @Transactional
    public AuthResponse inscriptionClient(InscriptionClientRequest request) {
        if (userRepository.existsByPhone(request.getTelephone())) {
            throw new RuntimeException("Ce numéro de téléphone est déjà utilisé");
        }

        User user = new User(
                request.getNomComplet(),
                request.getTelephone(),
                null, // Pas d'email pour les clients
                passwordEncoder.encode(request.getMotDePasse()),
                Role.CLIENT
        );

        user = userRepository.save(user);
        final User finalUser = user;
        
        // Envoyer email de bienvenue si l'utilisateur a un email
        if (finalUser.getEmail() != null) {
            try {
                emailService.envoyerEmailBienvenue(finalUser.getEmail(), finalUser.getFullName());
            } catch (Exception e) {
                System.err.println("Erreur envoi email bienvenue: " + e.getMessage());
            }
        }
        
        // Notifier l'admin des nouvelles inscriptions clients
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> {
            notificationService.creerNotification(
                admin.getId(),
                "Nouveau client inscrit",
                "Un nouveau client s'est inscrit: " + finalUser.getFullName() + " (" + finalUser.getPhone() + ")"
            );
        });
        
        String token = jwtService.generateToken(user.getId(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getIsVerified()
        );
    }

    @Transactional
    public AuthResponse inscriptionVendeur(InscriptionVendeurRequest request) {
        if (userRepository.existsByPhone(request.getTelephone())) {
            throw new RuntimeException("Ce numéro de téléphone est déjà utilisé");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        User user = new User(
                request.getNomComplet(),
                request.getTelephone(),
                request.getEmail(),
                passwordEncoder.encode(request.getMotDePasse()),
                Role.VENDOR
        );

        user = userRepository.save(user);
        final User finalUser = user;

        Vendor vendor = new Vendor(finalUser);
        vendorRepository.save(vendor);

        // Envoyer email de bienvenue
        try {
            emailService.envoyerEmailBienvenue(finalUser.getEmail(), finalUser.getFullName());
        } catch (Exception e) {
            System.err.println("Erreur envoi email bienvenue vendeur: " + e.getMessage());
        }

        // Notifier l'admin des nouvelles demandes vendeur
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> {
            notificationService.creerNotification(
                admin.getId(),
                "Nouvelle demande vendeur en attente",
                "Un nouveau vendeur demande validation: " + finalUser.getFullName() + " (" + finalUser.getPhone() + ")"
            );
        });

        String token = jwtService.generateToken(user.getId(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getIsVerified()
        );
    }

    @Transactional
    public void changerMotDePasse(UUID userId, ChangerMotDePasseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getPassword())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNouveauMotDePasse()));
        userRepository.save(user);
    }

    @Transactional
    public User findOrCreateOAuthUser(String email, String name, String provider) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User(
                            name,
                            null, // Pas de téléphone pour OAuth
                            email,
                            passwordEncoder.encode(UUID.randomUUID().toString()), // Mot de passe aléatoire
                            Role.CLIENT
                    );
                    newUser.setIsVerified(true); // Email vérifié par OAuth
                    return userRepository.save(newUser);
                });
    }
}