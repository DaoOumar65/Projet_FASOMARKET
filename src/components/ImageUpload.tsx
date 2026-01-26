import { useState } from 'react';
import { uploadShopImage } from '../services/uploadService';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (filePath: string) => void;
  currentImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const result = await uploadShopImage(file);
      
      if (result.success) {
        onImageUploaded(result.filePath);
        toast.success('Image uploadée avec succès');
      } else {
        toast.error(result.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8081/api/files/view/${imagePath.split('/').pop()}`;
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '14px', 
        fontWeight: '500', 
        color: '#374151', 
        marginBottom: '8px' 
      }}>
        Logo/Image de la boutique
      </label>
      
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        backgroundColor: 'white',
        transition: 'border-color 0.2s'
      }}>
        {preview ? (
          <div style={{ marginBottom: '12px' }}>
            <img 
              src={getImageUrl(preview) || ''}
              alt="Aperçu" 
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          </div>
        ) : (
          <div style={{
            color: '#9ca3af',
            fontSize: '14px',
            padding: '32px',
            border: '2px dashed #e5e7eb',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            📷 Aucune image sélectionnée
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
          id="image-upload"
        />
        
        <label 
          htmlFor="image-upload" 
          style={{
            padding: '8px 16px',
            backgroundColor: uploading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'inline-block',
            transition: 'background-color 0.2s'
          }}
        >
          {uploading ? 'Upload en cours...' : preview ? 'Changer l\'image' : 'Sélectionner une image'}
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;