import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { vendorService, publicService } from '../services/api';
import { useImageUpload } from '../hooks/useImageUpload';
import GestionVariantesComplete, { type VariantePersonnalisee } from '../components/GestionVariantesComplete';
import toast from 'react-hot-toast';

interface Categorie {
  id: string;
  nom: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface CategoryFormConfig {
  category: string;
  icon: string;
  fields: FormField[];
}

export default function AjouterProduit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { uploadImage, uploading: uploadingImage, MAX_IMAGES } = useImageUpload();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(null);
  const [categoryFormConfig, setCategoryFormConfig] = useState<CategoryFormConfig | null>(null);
  const [formData, setFormData] = useState<any>({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorieId: '',
    tags: [] as string[],
    tailles: [] as string[],
    couleurs: [] as string[],
    marque: '',
    matiere: '',
    poids: '',
    dimensions: '',
    garantie: '',
    origine: '',
    attributsPersonnalises: {} as { [key: string]: any }
  });
  const [tagInput, setTagInput] = useState('');
  const [tailleInput, setTailleInput] = useState('');
  const [couleurInput, setCouleurInput] = useState('');
  const [variantes, setVariantes] = useState<VariantePersonnalisee[]>([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formOptions, setFormOptions] = useState<{
    tailles: string[];
    couleurs: string[];
    marques: string[];
    origines: string[];
    garanties: string[];
    materiaux: string[];
    finitions: string[];
    capacites: string[];
    puissances: string[];
    parfums: string[];
    agesCibles: string[];
    genres: string[];
    saisons: string[];
    modeles: string[];
  }>({
    tailles: [],
    couleurs: [],
    marques: [],
    origines: [],
    garanties: [],
    materiaux: [],
    finitions: [],
    capacites: [],
    puissances: [],
    parfums: [],
    agesCibles: [],
    genres: [],
    saisons: [],
    modeles: []
  });

  // Composant réutilisable pour les sélections avec options
  const SelectWithOptions = ({ label, name, options, placeholder, required = false }: {
    label: string;
    name: string;
    options: string[];
    placeholder: string;
    required?: boolean;
  }) => (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
        {label} {required && '*'}
      </label>
      <select
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        required={required}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: 'white'
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value="autre">Autre (saisir manuellement)</option>
      </select>
      {formData[name] === 'autre' && (
        <input
          type="text"
          placeholder={`Saisir ${label.toLowerCase()}`}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            marginTop: '8px'
          }}
        />
      )}
    </div>
  );

  // Composant pour les sélections multiples avec badges
  const MultiSelectWithBadges = ({ label, items, onAdd, onRemove, inputValue, setInputValue, options }: {
    label: string;
    items: string[];
    onAdd: () => void;
    onRemove: (item: string) => void;
    inputValue: string;
    setInputValue: (value: string) => void;
    options: string[];
  }) => (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <select
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="">Sélectionner {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAdd}
          disabled={!inputValue}
          style={{
            padding: '10px 16px',
            backgroundColor: inputValue ? '#2563eb' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: inputValue ? 'pointer' : 'not-allowed'
          }}
        >
          Ajouter
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map((item: string) => (
          <span key={item} style={{
            padding: '4px 8px',
            backgroundColor: '#dbeafe',
            color: '#2563eb',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    fetchCategories();
    fetchFormOptions();
  }, []);

  useEffect(() => {
    if (selectedCategory?.id) {
      fetchCategoryFormFields(selectedCategory.id);
      fetchFormOptions(); // Recharger les options pour la catégorie sélectionnée
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await publicService.getCategories();
      console.log('Réponse catégories:', response);
      setCategories(response.data || response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      // Fallback avec des catégories par défaut
      setCategories([
        { id: '1', nom: 'Électronique' },
        { id: '2', nom: 'Vêtements' },
        { id: '3', nom: 'Maison & Jardin' },
        { id: '4', nom: 'Sport & Loisirs' }
      ]);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const response = await vendorService.getFormOptions(selectedCategory?.id);
      console.log('Options pour catégorie:', selectedCategory?.id, response);
      setFormOptions(response.data || {
        tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        couleurs: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert'],
        marques: ['Nike', 'Adidas', 'Samsung', 'Apple'],
        origines: ['Burkina Faso', 'France', 'Chine'],
        garanties: ['6 mois', '1 an', '2 ans'],
        materiaux: ['Coton', 'Bois', 'Métal'],
        finitions: ['Mat', 'Brillant', 'Satiné'],
        capacites: ['64GB', '128GB', '256GB'],
        puissances: ['5W', '10W', '65W'],
        parfums: ['Vanille', 'Rose', 'Sans parfum'],
        agesCibles: ['0-6 mois', '3-5 ans', 'Tout âge'],
        genres: ['Homme', 'Femme', 'Unisexe'],
        saisons: ['Été', 'Hiver', 'Mi-saison'],
        modeles: ['Standard', 'Premium', 'Bio']
      });
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      // Fallback avec options par catégorie
      const optionsByCategory: { [key: string]: any } = {
        '1': { // Électronique
          tailles: [],
          couleurs: ['Noir', 'Blanc', 'Argent', 'Or'],
          marques: ['Samsung', 'Apple', 'Huawei', 'Xiaomi'],
          modeles: ['Standard', 'Pro', 'Max', 'Ultra']
        },
        '2': { // Vêtements
          tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          couleurs: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert'],
          marques: ['Nike', 'Adidas', 'Zara', 'H&M'],
          modeles: ['Casual', 'Sport', 'Formal']
        }
      };
      
      const categoryOptions = optionsByCategory[selectedCategory?.id || ''] || {};
      setFormOptions({
        tailles: categoryOptions.tailles || [],
        couleurs: categoryOptions.couleurs || ['Noir', 'Blanc', 'Rouge'],
        marques: categoryOptions.marques || ['Marque générique'],
        origines: ['Burkina Faso', 'France', 'Chine'],
        garanties: ['6 mois', '1 an', '2 ans'],
        materiaux: ['Coton', 'Bois', 'Métal'],
        finitions: ['Mat', 'Brillant', 'Satiné'],
        capacites: ['64GB', '128GB', '256GB'],
        puissances: ['5W', '10W', '65W'],
        parfums: ['Vanille', 'Rose', 'Sans parfum'],
        agesCibles: ['0-6 mois', '3-5 ans', 'Tout âge'],
        genres: ['Homme', 'Femme', 'Unisexe'],
        saisons: ['Été', 'Hiver', 'Mi-saison'],
        modeles: categoryOptions.modeles || ['Standard', 'Premium']
      });
    }
  };

  const fetchCategoryFormFields = async (categoryId: string) => {
    try {
      const response = await vendorService.getCategoryFormFields(categoryId);
      setCategoryFormConfig(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des champs:', error);
      // Pas de configuration spéciale pour cette catégorie
      setCategoryFormConfig(null);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    
    if (categoryId === 'nouvelle') {
      setShowNewCategoryForm(true);
      return;
    }
    
    const category = categories.find(c => c.id === categoryId);
    setSelectedCategory(category || null);
    setFormData({ ...formData, categorieId: categoryId });
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Veuillez saisir un nom de catégorie');
      return;
    }

    try {
      const response = await vendorService.createCategory({
        nom: newCategoryName.trim(),
        description: `Catégorie créée par vendeur`,
        icone: '📎'
      });
      
      const newCategory = response.data;
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory);
      setFormData({ ...formData, categorieId: newCategory.id });
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      toast.success('Catégorie créée avec succès !');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la catégorie');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const validateFormData = () => {
    if (!formData.nom || !formData.description || !formData.prix || !formData.stock || !formData.categorieId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return null;
    }
    const prixNum = parseFloat(formData.prix);
    const stockNum = parseInt(formData.stock);
    if (isNaN(prixNum) || prixNum <= 0) {
      toast.error('Le prix doit être un nombre valide supérieur à 0');
      return null;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Le stock doit être un nombre valide');
      return null;
    }
    return { categorieId: formData.categorieId, prixNum, stockNum };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validation = validateFormData();
      if (!validation) {
        setLoading(false);
        return;
      }
      const { categorieId, prixNum, stockNum } = validation;
      const produitData: any = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        prix: prixNum,
        stock: stockNum,
        categorie: categorieId.trim(),
        images: imageUrls,
        tailles: formData.tailles,
        couleurs: formData.couleurs,
        marque: formData.marque.trim() || '',
        matiere: formData.matiere.trim() || '',
        poids: formData.poids.trim() || '',
        dimensions: formData.dimensions.trim() || '',
        garantie: formData.garantie.trim() || '',
        origine: formData.origine.trim() || ''
      };
      if (variantes.length > 0) {
        produitData.variantes = variantes;
      }
      await vendorService.creerProduit(produitData);
      toast.success('Produit ajouté avec succès !');
      navigate('/vendeur/produits');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images autorisées`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImage(files[i], 'produits');
        setImageUrls(prev => [...prev, url]);
        toast.success('Image ajoutée');
      } catch (error) {
        toast.error('Erreur upload image');
      }
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Fonctions utilitaires pour les tags, tailles et couleurs
  const addToArray = (value: string, arrayName: 'tags' | 'tailles' | 'couleurs', inputSetter: (value: string) => void) => {
    if (value.trim() && !formData[arrayName].includes(value.trim())) {
      setFormData({ ...formData, [arrayName]: [...formData[arrayName], value.trim()] });
      inputSetter('');
    }
  };

  const removeFromArray = (valueToRemove: string, arrayName: 'tags' | 'tailles' | 'couleurs') => {
    setFormData({ ...formData, [arrayName]: formData[arrayName].filter((item: string) => item !== valueToRemove) });
  };

  const addTag = () => addToArray(tagInput, 'tags', setTagInput);
  const removeTag = (tag: string) => removeFromArray(tag, 'tags');
  const addTaille = () => addToArray(tailleInput, 'tailles', setTailleInput);
  const removeTaille = (taille: string) => removeFromArray(taille, 'tailles');
  const addCouleur = () => addToArray(couleurInput, 'couleurs', setCouleurInput);
  const removeCouleur = (couleur: string) => removeFromArray(couleur, 'couleurs');

  const renderCategoryField = (field: FormField) => {
    const fieldStyle = {
      width: '100%',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px'
    };

    switch (field.type) {
      case 'select':
        return (
          <select name={field.name} value={formData[field.name] || ''} onChange={handleChange} required={field.required} style={fieldStyle}>
            <option value="">Sélectionner...</option>
            {field.options?.map(option => (<option key={option} value={option}>{option}</option>))}
          </select>
        );
      case 'multiselect':
        return (
          <select name={field.name} value={formData[field.name] || ''} onChange={handleChange} multiple style={fieldStyle}>
            {field.options?.map(option => (<option key={option} value={option}>{option}</option>))}
          </select>
        );
      case 'number':
        return (<input type="number" name={field.name} value={formData[field.name] || ''} onChange={handleChange} required={field.required} style={fieldStyle} />);
      case 'text':
      default:
        return (<input type="text" name={field.name} value={formData[field.name] || ''} onChange={handleChange} required={field.required} style={fieldStyle} />);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/vendeur/produits')} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', marginRight: '16px', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Ajouter un produit</h1>
          <p style={{ color: '#6b7280' }}>Créez un nouveau produit pour votre boutique</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>📝 Informations de base</h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Nom du produit *</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: iPhone 14 Pro Max" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} placeholder="Décrivez votre produit..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Prix (FCFA) *</label>
                <input type="number" name="prix" value={formData.prix} onChange={handleChange} required min="0" step="0.01"
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="25000" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Stock *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0"
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="10" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Catégorie *</label>
                <select name="categorieId" value={formData.categorieId} onChange={handleCategoryChange} required
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.nom}</option>))}
                  <option value="nouvelle" style={{ color: '#2563eb', fontWeight: '600' }}>+ Créer une nouvelle catégorie</option>
                </select>
                
                {showNewCategoryForm && (
                  <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Créer une nouvelle catégorie</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nom de la catégorie"
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && createNewCategory()}
                      />
                      <button
                        type="button"
                        onClick={createNewCategory}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Créer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryForm(false);
                          setNewCategoryName('');
                          setFormData({ ...formData, categorieId: '' });
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {categoryFormConfig && categoryFormConfig.fields && categoryFormConfig.fields.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              {categoryFormConfig.icon} Caractéristiques - {categoryFormConfig.category}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {categoryFormConfig.fields.map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    {field.label} {field.required && '*'}
                  </label>
                  {renderCategoryField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>📋 Détails du produit</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <MultiSelectWithBadges
              label="Tailles disponibles"
              items={formData.tailles}
              onAdd={addTaille}
              onRemove={removeTaille}
              inputValue={tailleInput}
              setInputValue={setTailleInput}
              options={formOptions.tailles}
            />
            <MultiSelectWithBadges
              label="Couleurs disponibles"
              items={formData.couleurs}
              onAdd={addCouleur}
              onRemove={removeCouleur}
              inputValue={couleurInput}
              setInputValue={setCouleurInput}
              options={formOptions.couleurs}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <SelectWithOptions
              label="Marque"
              name="marque"
              options={formOptions.marques}
              placeholder="Sélectionner une marque"
            />
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Matière</label>
              <select
                name="matiere"
                value={formData.matiere || ''}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Sélectionner une matière</option>
                {formOptions.materiaux.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
                <option value="autre">Autre (saisir manuellement)</option>
              </select>
              {formData.matiere === 'autre' && (
                <input
                  type="text"
                  placeholder="Saisir matière"
                  onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: '8px'
                  }}
                />
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Poids</label>
              <input type="text" name="poids" value={formData.poids} onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 200g" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Dimensions</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 30x20x10 cm" />
            </div>
            <SelectWithOptions
              label="Garantie"
              name="garantie"
              options={formOptions.garanties}
              placeholder="Sélectionner une garantie"
            />
            <SelectWithOptions
              label="Origine"
              name="origine"
              options={formOptions.origines}
              placeholder="Sélectionner un pays"
            />
          </div>
        </div>

        <GestionVariantesComplete
          categorieId={formData.categorieId}
          categorieNom={selectedCategory?.nom || 'Non définie'}
          variantes={variantes}
          onChange={setVariantes}
          stockGlobal={parseInt(formData.stock) || 0}
        />

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>🖼️ Images et Tags</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
              Images du produit
              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>({imageUrls.length}/{MAX_IMAGES})</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              {imageUrls.map((url, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={url} alt={`Produit ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <button type="button" onClick={() => removeImageUrl(index)} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label style={{ width: '100px', height: '100px', border: '2px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', cursor: (uploadingImage || imageUrls.length >= MAX_IMAGES) ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (uploadingImage || imageUrls.length >= MAX_IMAGES) ? 0.5 : 1 }}>
                <Upload size={20} color="#6b7280" />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{uploadingImage ? 'Upload...' : imageUrls.length >= MAX_IMAGES ? 'Max' : 'Ajouter'}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage || imageUrls.length >= MAX_IMAGES} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tags</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ajouter un tag..." />
              <button type="button" onClick={addTag} style={{ padding: '12px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Ajouter</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.tags.map((tag: string, index: number) => (
                <span key={index} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/vendeur/produits')} style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Annuler</button>
          <button type="submit" disabled={loading || uploadingImage} style={{ padding: '12px 24px', backgroundColor: (loading || uploadingImage) ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: (loading || uploadingImage) ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Ajout en cours...' : uploadingImage ? 'Upload images...' : 'Ajouter le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
