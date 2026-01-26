package com.example.fasomarket.config;

import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // Créer un admin par défaut si il n'existe pas
        if (!userRepository.existsByPhone("+22670000000")) {
            User admin = new User("Admin FasoMarket", "+22670000000", "admin@fasomarket.com", 
                                passwordEncoder.encode("admin123"), Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin créé: +22670000000 / admin123");
        }

        // Créer un vendeur de test si il n'existe pas
        if (!userRepository.existsByPhone("+22670000001")) {
            User vendorUser = new User("Vendeur Test", "+22670000001", "vendeur@test.com", 
                                     passwordEncoder.encode("vendeur123"), Role.VENDOR);
            vendorUser = userRepository.save(vendorUser);
            
            // Créer le profil vendeur approuvé
            Vendor vendor = new Vendor(vendorUser);
            vendor.setStatus(VendorStatus.COMPTE_VALIDE);
            vendorRepository.save(vendor);
            System.out.println("Vendeur créé: +22670000001 / vendeur123 (APPROUVÉ)");
        }

        System.out.println("=== COMPTES DE TEST ===");
        System.out.println("CLIENT: +22665300001 (mot de passe: celui utilisé lors de l'inscription)");
        System.out.println("ADMIN: +22670000000 / admin123");
        System.out.println("VENDEUR: +22670000001 / vendeur123");
    }
}