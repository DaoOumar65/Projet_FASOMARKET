package com.example.fasomarket.service;

import com.example.fasomarket.model.Category;
import com.example.fasomarket.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class CategoryFormService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Map<String, Object> getCategoryFormFields(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        return getCategoryFormFields(category.getName());
    }

    public Map<String, Object> getCategoryFormFields(String categoryName) {
        Map<String, Object> formConfig = new HashMap<>();
        
        switch (categoryName.toLowerCase()) {
            case "téléphones":
            case "smartphones":
                formConfig = getSmartphoneFields();
                break;
            case "vêtements":
            case "mode":
                formConfig = getClothingFields();
                break;
            case "électronique":
                formConfig = getElectronicsFields();
                break;
            case "maison":
            case "décoration":
                formConfig = getHomeFields();
                break;
            case "sport":
                formConfig = getSportsFields();
                break;
            case "beauté":
            case "cosmétiques":
                formConfig = getBeautyFields();
                break;
            default:
                formConfig = getDefaultFields();
        }
        
        return formConfig;
    }

    private Map<String, Object> getSmartphoneFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Téléphones");
        config.put("icon", "📱");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        // Champs spécifiques téléphones
        fields.add(createField("systemeExploitation", "Système d'exploitation", "select", true, 
            List.of("Android", "iOS", "Windows Phone", "Autre")));
        fields.add(createField("tailleEcran", "Taille écran (pouces)", "number", true, null));
        fields.add(createField("resolutionEcran", "Résolution écran", "text", false, null));
        fields.add(createField("processeur", "Processeur", "text", true, null));
        fields.add(createField("ram", "RAM (GB)", "number", true, null));
        fields.add(createField("stockage", "Stockage (GB)", "number", true, null));
        fields.add(createField("appareilPhoto", "Appareil photo (MP)", "text", false, null));
        fields.add(createField("batterie", "Batterie (mAh)", "number", false, null));
        fields.add(createField("connectivite", "Connectivité", "multiselect", false, 
            List.of("4G", "5G", "WiFi", "Bluetooth", "NFC")));
        fields.add(createField("etatProduit", "État", "select", true, 
            List.of("Neuf", "Reconditionné", "Occasion")));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> getClothingFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Vêtements");
        config.put("icon", "👕");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        fields.add(createField("genre", "Genre", "select", true, 
            List.of("Homme", "Femme", "Enfant", "Unisexe")));
        fields.add(createField("taille", "Taille", "select", true, 
            List.of("XS", "S", "M", "L", "XL", "XXL", "XXXL")));
        fields.add(createField("couleur", "Couleur", "text", true, null));
        fields.add(createField("matiere", "Matière", "text", true, null));
        fields.add(createField("saison", "Saison", "select", false, 
            List.of("Printemps", "Été", "Automne", "Hiver", "Toute saison")));
        fields.add(createField("styleVetement", "Style", "select", false, 
            List.of("Casual", "Formel", "Sport", "Soirée", "Travail")));
        fields.add(createField("entretien", "Instructions d'entretien", "text", false, null));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> getElectronicsFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Électronique");
        config.put("icon", "⚡");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        fields.add(createField("typeElectronique", "Type", "select", true, 
            List.of("Audio", "Vidéo", "Gaming", "Informatique", "Accessoires")));
        fields.add(createField("alimentation", "Alimentation", "text", false, null));
        fields.add(createField("consommation", "Consommation (W)", "number", false, null));
        fields.add(createField("connecteurs", "Connecteurs", "text", false, null));
        fields.add(createField("compatibilite", "Compatibilité", "text", false, null));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> getHomeFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Maison");
        config.put("icon", "🏠");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        fields.add(createField("piece", "Pièce", "select", false, 
            List.of("Salon", "Chambre", "Cuisine", "Salle de bain", "Bureau", "Extérieur")));
        fields.add(createField("style", "Style", "select", false, 
            List.of("Moderne", "Classique", "Industriel", "Scandinave", "Vintage")));
        fields.add(createField("materiaux", "Matériaux", "text", false, null));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> getSportsFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Sport");
        config.put("icon", "⚽");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        fields.add(createField("typeSport", "Type de sport", "select", true, 
            List.of("Football", "Basketball", "Tennis", "Running", "Fitness", "Natation", "Cyclisme")));
        fields.add(createField("niveau", "Niveau", "select", false, 
            List.of("Débutant", "Intermédiaire", "Avancé", "Professionnel")));
        fields.add(createField("genre", "Genre", "select", false, 
            List.of("Homme", "Femme", "Enfant", "Unisexe")));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> getBeautyFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Beauté");
        config.put("icon", "💄");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        fields.add(createField("typeBeaute", "Type", "select", true, 
            List.of("Maquillage", "Soin visage", "Soin corps", "Parfum", "Cheveux")));
        fields.add(createField("typePeau", "Type de peau", "select", false, 
            List.of("Normale", "Sèche", "Grasse", "Mixte", "Sensible")));
        fields.add(createField("genre", "Genre", "select", false, 
            List.of("Femme", "Homme", "Unisexe")));
        fields.add(createField("ingredients", "Ingrédients principaux", "text", false, null));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> getDefaultFields() {
        Map<String, Object> config = new HashMap<>();
        config.put("category", "Général");
        config.put("icon", "📦");
        
        List<Map<String, Object>> fields = new ArrayList<>();
        
        fields.add(createField("caracteristiques", "Caractéristiques", "text", false, null));
        fields.add(createField("utilisation", "Utilisation", "text", false, null));
        
        config.put("fields", fields);
        return config;
    }

    private Map<String, Object> createField(String name, String label, String type, boolean required, List<String> options) {
        Map<String, Object> field = new HashMap<>();
        field.put("name", name);
        field.put("label", label);
        field.put("type", type);
        field.put("required", required);
        if (options != null) {
            field.put("options", options);
        }
        return field;
    }
}