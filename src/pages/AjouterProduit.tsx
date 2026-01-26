import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { vendorService, publicService } from '../services/api';
import { useImageUpload } from '../hooks/useImageUpload';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryFormFields(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await publicService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const fetchCategoryFormFields = async (categoryId: string) => {
    try {
      const response = await vendorService.getCategoryFormFields(categoryId);
      setCategoryFormConfig(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des champs:', error);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setFormData({ ...formData, categorieId: categoryId });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categorieId = typeof formData.categorieId === 'object' 
        ? formData.categorieId.id || formData.categorieId.value 
        : formData.categorieId;

      if (!formData.nom || !formData.description || !formData.prix || !formData.stock || !categorieId) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }

      const prixNum = parseFloat(formData.prix);
      const stockNum = parseInt(formData.stock);
      
      if (isNaN(prixNum) || prixNum <= 0) {
        toast.error('Le prix doit être un nombre valide supérieur à 0');
        setLoading(false);
        return;
      }
      
      if (isNaN(stockNum) || stockNum < 0) {
        toast.error('Le stock doit être un nombre valide');
        setLoading(false);
        return;
      }

      const produitData = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        prix: prixNum,
        stock: stockNum,
        categorieId: categorieId.trim(),
        images: imageUrls,
        sizes: formData.tailles.length > 0 ? JSON.stringify(formData.tailles) : '[]',
        colors: formData.couleurs.length > 0 ? JSON.stringify(formData.couleurs) : '[]',
        marque: formData.marque.trim() || '',
        materiau: formData.matiere.trim() || '',
        poids: formData.poids.trim() || '',
        dimensions: formData.dimensions.trim() || '',
        periodeGarantie: formData.garantie.trim() || '',
        origine: formData.origine.trim() || '',
        // Nouveaux champs pour les détails
        tailles: formData.tailles,
        couleurs: formData.couleurs,
        matiere: formData.matiere.trim() || '',
        garantie: formData.garantie.trim() || ''
      };

      await vendorService.creerProduit(produitData);
      toast.success('Produit ajouté avec succès !');
      navigate('/vendeur/produits');
    } catch (error: any) {
      console.error('Erreur:', error.response?.data);
      if (error.response?.data?.errors) {
        const erreurs = error.response.data.errors;
        const messages = Object.keys(erreurs).map(key => `${key}: ${erreurs[key]}`).join(', ');
        toast.error(`Validation: ${messages}`);
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du produit');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const addTaille = () => {
    if (tailleInput.trim() && !formData.tailles.includes(tailleInput.trim())) {
      setFormData({ ...formData, tailles: [...formData.tailles, tailleInput.trim()] });
      setTailleInput('');
    }
  };

  const removeTaille = (taille: string) => {
    setFormData({ ...formData, tailles: formData.tailles.filter(t => t !== taille) });
  };

  const addCouleur = () => {
    if (couleurInput.trim() && !formData.couleurs.includes(couleurInput.trim())) {
      setFormData({ ...formData, couleurs: [...formData.couleurs, couleurInput.trim()] });
      setCouleurInput('');
    }
  };

  const removeCouleur = (couleur: string) => {
    setFormData({ ...formData, couleurs: formData.couleurs.filter(c => c !== couleur) });
  };

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
                </select>
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Tailles disponibles</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input type="text" value={tailleInput} onChange={(e) => setTailleInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTaille())}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: S, M, L, XL" />
                <button type="button" onClick={addTaille} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {formData.tailles.map((taille: string) => (
                  <span key={taille} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {taille}
                    <button type="button" onClick={() => removeTaille(taille)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Couleurs disponibles</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input type="text" value={couleurInput} onChange={(e) => setCouleurInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCouleur())}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: Rouge, Bleu, Vert" />
                <button type="button" onClick={addCouleur} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {formData.couleurs.map((couleur: string) => (
                  <span key={couleur} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {couleur}
                    <button type="button" onClick={() => removeCouleur(couleur)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '0' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Marque</label>
              <input type="text" name="marque" value={formData.marque} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: Nike" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Matière</label>
              <input type="text" name="matiere" value={formData.matiere} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 100% Coton" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Poids</label>
              <input type="text" name="poids" value={formData.poids} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 200g" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Dimensions</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 30x20x10 cm" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Garantie</label>
              <input type="text" name="garantie" value={formData.garantie} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: 6 mois" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Origine</label>
              <input type="text" name="origine" value={formData.origine} onChange={handleChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ex: Burkina Faso" />
            </div>
          </div>
        </div>

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
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }} placeholder="Ajouter un tag..." />
              <button type="button" onClick={addTag} style={{ padding: '12px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Ajouter</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.tags.map((tag, index) => (
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
