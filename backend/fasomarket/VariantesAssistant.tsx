// components/VariantesAssistant.tsx
import React, { useState, useEffect } from 'react';
import { TEMPLATES_VARIANTES, VarianteTemplate, SuggestionVariante } from '../services/variantesAssistantService';

interface Props {
  categorieId: string;
  categorieNom: string;
  onVariantesGenerated: (variantes: any[]) => void;
}

export const VariantesAssistant: React.FC<Props> = ({ 
  categorieId, 
  categorieNom, 
  onVariantesGenerated 
}) => {
  const [etape, setEtape] = useState<'choix' | 'assistant' | 'manuel'>('choix');
  const [suggestions, setSuggestions] = useState<SuggestionVariante[]>([]);
  const [templates, setTemplates] = useState<VarianteTemplate[]>([]);
  const [optionsSelectionnees, setOptionsSelectionnees] = useState<Record<string, string[]>>({});
  const [variantesGenerees, setVariantesGenerees] = useState<any[]>([]);

  useEffect(() => {
    // Charger les suggestions pour la catégorie
    const templateData = TEMPLATES_VARIANTES[categorieNom as keyof typeof TEMPLATES_VARIANTES];
    if (templateData) {
      setSuggestions(templateData.suggestions);
      setTemplates(templateData.variantesPredefines);
    }
  }, [categorieNom]);

  const utiliserTemplate = (template: VarianteTemplate) => {
    const variante = {
      ...template.valeurs,
      prixAjustement: template.prixAjustement,
      stock: 5 // Stock par défaut
    };
    onVariantesGenerated([variante]);
  };

  const utiliserTousLesTemplates = () => {
    const variantes = templates.map(template => ({
      ...template.valeurs,
      prixAjustement: template.prixAjustement,
      stock: 5
    }));
    onVariantesGenerated(variantes);
  };

  const genererVariantesAutomatiques = () => {
    // Générer toutes les combinaisons possibles
    const champs = Object.keys(optionsSelectionnees);
    if (champs.length === 0) return;

    const genererCombinaisons = (index: number, combinaisonActuelle: Record<string, string>): any[] => {
      if (index === champs.length) {
        return [{
          ...combinaisonActuelle,
          prixAjustement: 0,
          stock: 3
        }];
      }

      const champ = champs[index];
      const options = optionsSelectionnees[champ];
      const resultats: any[] = [];

      for (const option of options) {
        const nouvelleCombinaisonActuelle = { ...combinaisonActuelle, [champ]: option };
        resultats.push(...genererCombinaisons(index + 1, nouvelleCombinaisonActuelle));
      }

      return resultats;
    };

    const variantes = genererCombinaisons(0, {});
    setVariantesGenerees(variantes);
  };

  const ajouterOption = (champ: string, valeur: string) => {
    if (!valeur.trim()) return;
    
    setOptionsSelectionnees(prev => ({
      ...prev,
      [champ]: [...(prev[champ] || []), valeur]
    }));
  };

  const retirerOption = (champ: string, valeur: string) => {
    setOptionsSelectionnees(prev => ({
      ...prev,
      [champ]: (prev[champ] || []).filter(v => v !== valeur)
    }));
  };

  if (etape === 'choix') {
    return (
      <div className="variantes-assistant bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🤖 Assistant Variantes</h3>
        <p className="text-gray-600 mb-6">
          Comment souhaitez-vous définir les variantes pour votre produit <strong>{categorieNom}</strong> ?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setEtape('assistant')}
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-colors"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium mb-2">Assistant Intelligent</h4>
            <p className="text-sm text-gray-600">
              Laissez-moi vous guider pour créer les variantes parfaites
            </p>
          </button>

          <button
            onClick={utiliserTousLesTemplates}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-100 transition-colors"
          >
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium mb-2">Templates Rapides</h4>
            <p className="text-sm text-gray-600">
              Utiliser les variantes les plus populaires ({templates.length} variantes)
            </p>
          </button>

          <button
            onClick={() => setEtape('manuel')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-100 transition-colors"
          >
            <div className="text-2xl mb-2">✏️</div>
            <h4 className="font-medium mb-2">Création Manuelle</h4>
            <p className="text-sm text-gray-600">
              Créer mes variantes de A à Z
            </p>
          </button>
        </div>

        {templates.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Ou choisir un template spécifique :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => utiliserTemplate(template)}
                  className="p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{template.nom}</div>
                  <div className="text-sm text-gray-600">
                    {Object.entries(template.valeurs).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </div>
                  <div className="text-sm text-blue-600">
                    Ajustement: {template.prixAjustement} FCFA
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (etape === 'assistant') {
    return (
      <div className="variantes-assistant bg-blue-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">🎯 Assistant Intelligent</h3>
          <button
            onClick={() => setEtape('choix')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Sélectionnez les options que vous souhaitez proposer pour chaque caractéristique :
        </p>

        <div className="space-y-6">
          {suggestions.map((suggestion) => (
            <div key={suggestion.champ} className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium">
                  {suggestion.label}
                  {suggestion.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {suggestion.description && (
                  <span className="text-sm text-gray-500">{suggestion.description}</span>
                )}
              </div>

              {suggestion.type === 'select' && suggestion.options && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {suggestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          const isSelected = optionsSelectionnees[suggestion.champ]?.includes(option);
                          if (isSelected) {
                            retirerOption(suggestion.champ, option);
                          } else {
                            ajouterOption(suggestion.champ, option);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          optionsSelectionnees[suggestion.champ]?.includes(option)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  {optionsSelectionnees[suggestion.champ]?.length > 0 && (
                    <div className="text-sm text-green-600">
                      ✓ {optionsSelectionnees[suggestion.champ].length} option(s) sélectionnée(s)
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <div className="text-sm text-gray-600">
            {Object.values(optionsSelectionnees).reduce((total, options) => total * (options.length || 1), 1)} variante(s) seront générées
          </div>
          
          <div className="space-x-3">
            <button
              onClick={genererVariantesAutomatiques}
              disabled={Object.keys(optionsSelectionnees).length === 0}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              Générer les Variantes
            </button>
          </div>
        </div>

        {variantesGenerees.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-3">Aperçu des variantes générées :</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {variantesGenerees.slice(0, 10).map((variante, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  {Object.entries(variante)
                    .filter(([k]) => k !== 'prixAjustement' && k !== 'stock')
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' • ')}
                </div>
              ))}
              {variantesGenerees.length > 10 && (
                <div className="text-sm text-gray-500">
                  ... et {variantesGenerees.length - 10} autres variantes
                </div>
              )}
            </div>
            
            <button
              onClick={() => onVariantesGenerated(variantesGenerees)}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Utiliser ces {variantesGenerees.length} variantes
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="variantes-assistant bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">✏️ Création Manuelle</h3>
        <button
          onClick={() => setEtape('choix')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Retour
        </button>
      </div>
      <p className="text-gray-600">
        Vous avez choisi de créer vos variantes manuellement. 
        Utilisez le formulaire ci-dessous pour ajouter chaque variante individuellement.
      </p>
    </div>
  );
};