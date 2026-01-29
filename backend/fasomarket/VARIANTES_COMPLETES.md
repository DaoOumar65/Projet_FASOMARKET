# 🎯 Types Frontend Étendus - Toutes les Variantes

```typescript
// types/variantes.ts
export interface ProduitVarianteComplete {
  id: number;
  produitId: string;
  
  // Variantes de base
  couleur?: string;
  taille?: string;
  modele?: string;
  
  // Variantes étendues
  poids?: number;
  dimensions?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  puissance?: string;
  parfum?: string;
  ageCible?: string;
  genre?: string;
  saison?: string;
  
  // Données produit
  prixAjustement: number;
  stock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface VarianteOptions {
  couleurs?: string[];
  tailles?: string[];
  modeles?: string[];
  materiaux?: string[];
  finitions?: string[];
  capacites?: string[];
  parfums?: string[];
  genres?: string[];
  saisons?: string[];
}

export interface VarianteSelection {
  couleur?: string;
  taille?: string;
  modele?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  parfum?: string;
  genre?: string;
  saison?: string;
}

// Variantes par catégorie
export interface VariantesVetements {
  couleur: string;
  taille: string;
  genre: 'Homme' | 'Femme' | 'Unisexe';
  saison: 'Été' | 'Hiver' | 'Mi-saison';
  ageCible?: string;
}

export interface VariantesElectronique {
  couleur: string;
  capacite: string;
  modele: string;
  puissance?: string;
}

export interface VariantesCosmetiques {
  parfum: string;
  finition: 'Mat' | 'Brillant' | 'Satiné';
  genre: 'Homme' | 'Femme' | 'Unisexe';
}

export interface VariantesAlimentaire {
  poids: number;
  modele: 'Bio' | 'Standard' | 'Premium';
}

export interface VariantesMaison {
  couleur: string;
  materiau: string;
  finition: string;
  dimensions?: string;
}
```

## 🎨 Composant Sélecteur Universel

```tsx
// components/VarianteSelectorUniversel.tsx
import React, { useState, useEffect } from 'react';

interface Props {
  produitId: string;
  categorie: string;
  prixBase: number;
  onVarianteChange: (variante: ProduitVarianteComplete | null, prixTotal: number) => void;
}

export const VarianteSelectorUniversel: React.FC<Props> = ({ 
  produitId, 
  categorie, 
  prixBase, 
  onVarianteChange 
}) => {
  const [variantes, setVariantes] = useState<ProduitVarianteComplete[]>([]);
  const [selection, setSelection] = useState<VarianteSelection>({});
  const [options, setOptions] = useState<VarianteOptions>({});

  useEffect(() => {
    const loadVariantes = async () => {
      try {
        const data = await api.getVariantesProduit(produitId);
        setVariantes(data);
        
        // Extraire les options disponibles
        const opts: VarianteOptions = {
          couleurs: [...new Set(data.map(v => v.couleur).filter(Boolean))],
          tailles: [...new Set(data.map(v => v.taille).filter(Boolean))],
          modeles: [...new Set(data.map(v => v.modele).filter(Boolean))],
          materiaux: [...new Set(data.map(v => v.materiau).filter(Boolean))],
          finitions: [...new Set(data.map(v => v.finition).filter(Boolean))],
          capacites: [...new Set(data.map(v => v.capacite).filter(Boolean))],
          parfums: [...new Set(data.map(v => v.parfum).filter(Boolean))],
          genres: [...new Set(data.map(v => v.genre).filter(Boolean))],
          saisons: [...new Set(data.map(v => v.saison).filter(Boolean))]
        };
        setOptions(opts);
      } catch (error) {
        console.error('Erreur chargement variantes:', error);
      }
    };
    loadVariantes();
  }, [produitId]);

  useEffect(() => {
    // Trouver la variante correspondante
    const variante = variantes.find(v => 
      (!selection.couleur || v.couleur === selection.couleur) &&
      (!selection.taille || v.taille === selection.taille) &&
      (!selection.modele || v.modele === selection.modele) &&
      (!selection.materiau || v.materiau === selection.materiau) &&
      (!selection.finition || v.finition === selection.finition) &&
      (!selection.capacite || v.capacite === selection.capacite) &&
      (!selection.parfum || v.parfum === selection.parfum) &&
      (!selection.genre || v.genre === selection.genre) &&
      (!selection.saison || v.saison === selection.saison)
    );
    
    const prixTotal = variante 
      ? prixBase + variante.prixAjustement 
      : prixBase;
    
    onVarianteChange(variante || null, prixTotal);
  }, [selection, variantes, prixBase]);

  const renderSelector = (
    label: string, 
    options: string[] | undefined, 
    value: string | undefined, 
    onChange: (value: string) => void
  ) => {
    if (!options || options.length === 0) return null;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                value === option 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="variante-selector-universel space-y-4">
      {renderSelector('Couleur', options.couleurs, selection.couleur, 
        (couleur) => setSelection(prev => ({ ...prev, couleur })))}
      
      {renderSelector('Taille', options.tailles, selection.taille,
        (taille) => setSelection(prev => ({ ...prev, taille })))}
      
      {renderSelector('Modèle', options.modeles, selection.modele,
        (modele) => setSelection(prev => ({ ...prev, modele })))}
      
      {renderSelector('Matériau', options.materiaux, selection.materiau,
        (materiau) => setSelection(prev => ({ ...prev, materiau })))}
      
      {renderSelector('Finition', options.finitions, selection.finition,
        (finition) => setSelection(prev => ({ ...prev, finition })))}
      
      {renderSelector('Capacité', options.capacites, selection.capacite,
        (capacite) => setSelection(prev => ({ ...prev, capacite })))}
      
      {renderSelector('Parfum', options.parfums, selection.parfum,
        (parfum) => setSelection(prev => ({ ...prev, parfum })))}
      
      {renderSelector('Genre', options.genres, selection.genre,
        (genre) => setSelection(prev => ({ ...prev, genre })))}
      
      {renderSelector('Saison', options.saisons, selection.saison,
        (saison) => setSelection(prev => ({ ...prev, saison })))}
    </div>
  );
};
```

## 📱 Composants Spécialisés par Catégorie

```tsx
// components/VariantesVetements.tsx
export const VariantesVetements: React.FC<Props> = ({ variantes, onSelect }) => {
  return (
    <div className="variantes-vetements">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Couleur</label>
          {/* Sélecteur couleur avec aperçu visuel */}
        </div>
        <div>
          <label>Taille</label>
          {/* Guide des tailles intégré */}
        </div>
      </div>
    </div>
  );
};

// components/VariantesElectronique.tsx
export const VariantesElectronique: React.FC<Props> = ({ variantes, onSelect }) => {
  return (
    <div className="variantes-electronique">
      <div className="space-y-4">
        <div>
          <label>Capacité de stockage</label>
          {/* Prix différentiel affiché */}
        </div>
        <div>
          <label>Couleur</label>
          {/* Aperçu produit par couleur */}
        </div>
      </div>
    </div>
  );
};
```

## 🎯 Résumé des Variantes Ajoutées

### ✅ **Variantes Universelles**
- **Poids** - Pour alimentaire, cosmétiques
- **Dimensions** - Pour meubles, électronique
- **Matériau** - Pour maison, bijoux
- **Finition** - Pour cosmétiques, meubles
- **Capacité** - Pour électronique (128GB, 256GB)
- **Puissance** - Pour électroménager
- **Parfum** - Pour cosmétiques
- **Âge cible** - Pour vêtements enfants
- **Genre** - Homme/Femme/Unisexe
- **Saison** - Été/Hiver/Mi-saison

### ✅ **Services Spécialisés**
- **VarianteCategorieService** - Génération par catégorie
- **Sélecteur universel** - Interface adaptative
- **Types étendus** - Support complet frontend

### ✅ **Catégories Supportées**
- **Mode/Vêtements** - Couleur, taille, genre, saison
- **Électronique** - Couleur, capacité, modèle
- **Cosmétiques** - Parfum, finition, genre
- **Alimentaire** - Poids, qualité (Bio/Standard)
- **Maison** - Couleur, matériau, finition

Le système de variantes est maintenant **universel et extensible** ! 🚀