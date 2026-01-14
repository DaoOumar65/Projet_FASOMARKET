import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { vendorService, publicService } from '../services/api';
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
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryFormConfig, setCategoryFormConfig] = useState<CategoryFormConfig | null>(null);
  const [formData, setFormData] = useState<any>({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorieId: '',
    images: [] as File[],
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const produitData = {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        categorieId: formData.categorieId,
        images: formData.images,
        tags: formData.tags,
        ...formData // Inclure tous les champs spécifiques à la catégorie
      };

      await vendorService.creerProduit(produitData);
      toast.success('Produit ajouté avec succès !');
      navigate('/vendeur/produits');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du produit');
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

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setFormData({ ...formData, images: [...formData.images, ...newImages] });
    }
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
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
        {/* Informations de base */}
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

        {/* Champs spécifiques à la catégorie */}
        {categoryFormConfig && (
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

        {/* Images et Tags */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>🖼️ Images et Tags</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Images du produit</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              {formData.images.map((image: File, index: number) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={URL.createObjectURL(image)} alt={`Produit ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label style={{ width: '100px', height: '100px', border: '2px dashed #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Upload size={20} color="#6b7280" />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Ajouter</span>
                <input type="file" accept="image/*" multiple onChange={addImage} style={{ display: 'none' }} />
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

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/vendeur/produits')} style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Annuler</button>
          <button type="submit" disabled={loading} style={{ padding: '12px 24px', backgroundColor: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}