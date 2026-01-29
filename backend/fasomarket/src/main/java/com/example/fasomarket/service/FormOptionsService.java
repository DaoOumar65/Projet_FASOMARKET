package com.example.fasomarket.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class FormOptionsService {
    
    // Cache des options pour éviter de les recalculer à chaque appel
    private static final Map<String, List<String>> OPTIONS_CACHE = new HashMap<>();
    
    static {
        initializeOptions();
    }
    
    public Map<String, Object> getAllFormOptions() {
        Map<String, Object> options = new HashMap<>();
        
        // Copier toutes les options du cache
        for (Map.Entry<String, List<String>> entry : OPTIONS_CACHE.entrySet()) {
            options.put(entry.getKey(), new ArrayList<>(entry.getValue()));
        }
        
        return options;
    }
    
    public List<String> getOptionsByCategory(String category) {
        return OPTIONS_CACHE.getOrDefault(category, new ArrayList<>());
    }
    
    public Map<String, Object> getOptionsForCategory(String categoryName) {
        Map<String, Object> options = new HashMap<>();
        
        switch (categoryName.toLowerCase()) {
            case "mode":
            case "vêtements":
                options.put("tailles", getOptionsByCategory("tailles"));
                options.put("couleurs", getOptionsByCategory("couleurs"));
                options.put("materiaux", Arrays.asList("Coton", "Polyester", "Lin", "Soie", "Laine", "Denim"));
                options.put("genres", getOptionsByCategory("genres"));
                options.put("saisons", getOptionsByCategory("saisons"));
                break;
                
            case "electronique":
                options.put("couleurs", Arrays.asList("Noir", "Blanc", "Gris", "Bleu", "Rouge"));
                options.put("capacites", getOptionsByCategory("capacites"));
                options.put("marques", Arrays.asList("Samsung", "Apple", "Huawei", "Xiaomi", "Sony", "LG"));
                options.put("puissances", getOptionsByCategory("puissances"));
                break;
                
            case "cosmétiques":
            case "beauté":
                options.put("parfums", getOptionsByCategory("parfums"));
                options.put("finitions", Arrays.asList("Mat", "Brillant", "Satiné", "Nacré"));
                options.put("genres", getOptionsByCategory("genres"));
                break;
                
            case "alimentaire":
                options.put("modeles", Arrays.asList("Standard", "Bio", "Premium", "Artisanal"));
                options.put("origines", getOptionsByCategory("origines"));
                break;
                
            case "maison":
            case "décoration":
                options.put("couleurs", getOptionsByCategory("couleurs"));
                options.put("materiaux", Arrays.asList("Bois", "Métal", "Plastique", "Verre", "Céramique"));
                options.put("finitions", getOptionsByCategory("finitions"));
                break;
                
            default:
                // Options génériques pour catégories non spécifiées
                options.put("couleurs", getOptionsByCategory("couleurs"));
                options.put("tailles", getOptionsByCategory("tailles"));
                options.put("modeles", Arrays.asList("Standard", "Premium", "Deluxe"));
        }
        
        return options;
    }
    
    private static void initializeOptions() {
        // Tailles
        OPTIONS_CACHE.put("tailles", Arrays.asList(
            "XS", "S", "M", "L", "XL", "XXL", "XXXL",
            "34", "36", "38", "40", "42", "44", "46", "48", "50",
            "Unique", "Ajustable"
        ));
        
        // Couleurs
        OPTIONS_CACHE.put("couleurs", Arrays.asList(
            "Noir", "Blanc", "Gris", "Rouge", "Bleu", "Vert", "Jaune", 
            "Orange", "Rose", "Violet", "Marron", "Beige", "Doré", 
            "Argenté", "Multicolore", "Transparent"
        ));
        
        // Marques
        OPTIONS_CACHE.put("marques", Arrays.asList(
            "Samsung", "Apple", "Huawei", "Xiaomi", "Oppo", "Vivo",
            "Nike", "Adidas", "Puma", "Reebok",
            "Zara", "H&M", "Uniqlo", "Mango",
            "Sony", "LG", "Panasonic", "Philips",
            "Local", "Artisanal", "Fait main", "Import"
        ));
        
        // Origines
        OPTIONS_CACHE.put("origines", Arrays.asList(
            "Burkina Faso", "Mali", "Côte d'Ivoire", "Ghana", "Sénégal",
            "Nigeria", "Bénin", "Togo", "Niger",
            "Chine", "Inde", "Turquie", "France", "Allemagne",
            "États-Unis", "Japon", "Corée du Sud",
            "Local", "Régional", "Africain", "Européen", "Asiatique"
        ));
        
        // Garanties
        OPTIONS_CACHE.put("garanties", Arrays.asList(
            "Aucune", "1 mois", "3 mois", "6 mois", 
            "1 an", "2 ans", "3 ans", "5 ans", 
            "Garantie constructeur", "Garantie magasin", "Garantie étendue"
        ));
        
        // Matériaux
        OPTIONS_CACHE.put("materiaux", Arrays.asList(
            "Coton", "Polyester", "Lin", "Soie", "Laine", "Denim",
            "Cuir", "Cuir synthétique", "Daim",
            "Bois", "Métal", "Plastique", "Verre", "Céramique",
            "Aluminium", "Acier inoxydable", "Titane",
            "Bambou", "Rotin", "Osier", "Tissu", "Velours"
        ));
        
        // Finitions
        OPTIONS_CACHE.put("finitions", Arrays.asList(
            "Mat", "Brillant", "Satiné", "Texturé", "Lisse",
            "Antique", "Vintage", "Moderne", "Rustique",
            "Poli", "Brossé", "Gravé", "Émaillé", "Verni"
        ));
        
        // Capacités
        OPTIONS_CACHE.put("capacites", Arrays.asList(
            "16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB",
            "500ml", "1L", "1.5L", "2L", "5L",
            "Petit", "Moyen", "Grand", "Très grand"
        ));
        
        // Puissances
        OPTIONS_CACHE.put("puissances", Arrays.asList(
            "5W", "10W", "15W", "20W", "25W", "30W", "45W", "65W", "100W",
            "Faible", "Moyenne", "Élevée", "Très élevée"
        ));
        
        // Parfums
        OPTIONS_CACHE.put("parfums", Arrays.asList(
            "Vanille", "Rose", "Lavande", "Citrus", "Menthe", "Jasmin",
            "Coco", "Amande", "Miel", "Thé vert", "Aloe vera",
            "Sans parfum", "Parfum naturel", "Parfum synthétique"
        ));
        
        // Âges cibles
        OPTIONS_CACHE.put("agesCibles", Arrays.asList(
            "0-6 mois", "6-12 mois", "1-2 ans", "3-5 ans", "6-10 ans", 
            "11-15 ans", "16-18 ans", "18-25 ans", "25-35 ans", 
            "35-50 ans", "50+ ans", "Tout âge"
        ));
        
        // Genres
        OPTIONS_CACHE.put("genres", Arrays.asList(
            "Homme", "Femme", "Unisexe", "Garçon", "Fille", "Enfant"
        ));
        
        // Saisons
        OPTIONS_CACHE.put("saisons", Arrays.asList(
            "Été", "Hiver", "Printemps", "Automne", 
            "Mi-saison", "Toute saison", "Période sèche", "Période pluvieuse"
        ));
        
        // Modèles
        OPTIONS_CACHE.put("modeles", Arrays.asList(
            "Standard", "Premium", "Deluxe", "Pro", "Max", "Mini", "Lite",
            "Bio", "Écologique", "Naturel", "Artisanal", "Fait main",
            "Import", "Local", "Traditionnel", "Moderne", "Vintage"
        ));
    }
}