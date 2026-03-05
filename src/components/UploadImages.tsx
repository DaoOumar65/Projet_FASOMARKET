import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, AlertCircle, Check, Loader } from 'lucide-react';
import { uploadService, ImageUploadResult } from '../services/uploadService';
import toast from 'react-hot-toast';

interface Props {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // en MB
  acceptedFormats?: string[];
  initialImages?: string[];
  disabled?: boolean;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  progress?: number;
}

const UploadImages: React.FC<Props> = ({
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  initialImages = [],
  disabled = false
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser avec les images existantes
  React.useEffect(() => {
    if (initialImages.length > 0) {
      const existingImages: ImageFile[] = initialImages.map((url, index) => ({
        id: `existing-${index}`,
        file: new File([], 'existing'),
        preview: url,
        status: 'success',
        url
      }));
      setImages(existingImages);
    }
  }, [initialImages]);

  // Notifier les changements
  React.useEffect(() => {
    const successImages = images
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url!);
    onImagesChange(successImages);
  }, [images, onImagesChange]);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Utilisez: ${acceptedFormats.join(', ')}`;
    }
    
    if (file.size > maxSizePerImage * 1024 * 1024) {
      return `Fichier trop volumineux. Maximum: ${maxSizePerImage}MB`;
    }
    
    return null;
  };

  const processFiles = useCallback(async (files: FileList) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(`Maximum ${maxImages} images autorisées`);
      return;
    }

    const newImages: ImageFile[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      const id = `${Date.now()}-${Math.random()}`;
      
      const imageFile: ImageFile = {
        id,
        file,
        preview: URL.createObjectURL(file),
        status: error ? 'error' : 'pending',
        error,
        progress: 0
      };
      
      newImages.push(imageFile);
    }
    
    setImages(prev => [...prev, ...newImages]);
    
    // Upload des fichiers valides
    for (const imageFile of newImages) {
      if (imageFile.status === 'pending') {
        await uploadImage(imageFile);
      }
    }
  }, [images.length, maxImages, disabled]);

  const uploadImage = async (imageFile: ImageFile) => {
    setImages(prev => prev.map(img => 
      img.id === imageFile.id 
        ? { ...img, status: 'uploading', progress: 0 }
        : img
    ));

    try {
      const result = await uploadService.uploadImage(
        imageFile.file,
        (progress) => {
          setImages(prev => prev.map(img => 
            img.id === imageFile.id 
              ? { ...img, progress }
              : img
          ));
        }
      );

      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: 'success', url: result.url, progress: 100 }
          : img
      ));

      toast.success('Image uploadée avec succès');
    } catch (error: any) {
      setImages(prev => prev.map(img => 
        img.id === imageFile.id 
          ? { ...img, status: 'error', error: error.message || 'Erreur upload' }
          : img
      ));
      
      toast.error('Erreur lors de l\'upload');
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const retryUpload = (id: string) => {
    const imageFile = images.find(img => img.id === id);
    if (imageFile) {
      uploadImage(imageFile);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload-images">
      {/* Zone de drop */}
      {images.length < maxImages && (
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          
          <div className="drop-content">
            <Upload size={48} />
            <h3>Glissez vos images ici</h3>
            <p>ou cliquez pour sélectionner</p>
            <div className="format-info">
              <small>
                Formats: {acceptedFormats.map(f => f.split('/')[1]).join(', ')} • 
                Max: {maxSizePerImage}MB par image • 
                {maxImages - images.length} restante(s)
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Grille des images */}
      {images.length > 0 && (
        <div className="images-grid">
          {images.map((imageFile) => (
            <div key={imageFile.id} className="image-item">
              <div className="image-container">
                <img 
                  src={imageFile.preview} 
                  alt="Preview" 
                  className="image-preview"
                />
                
                {/* Overlay de statut */}
                <div className={`status-overlay ${imageFile.status}`}>
                  {imageFile.status === 'uploading' && (
                    <div className="upload-progress">
                      <Loader size={20} className="spinning" />
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${imageFile.progress || 0}%` }}
                        />
                      </div>
                      <span>{imageFile.progress || 0}%</span>
                    </div>
                  )}
                  
                  {imageFile.status === 'success' && (
                    <div className="success-indicator">
                      <Check size={20} />
                    </div>
                  )}
                  
                  {imageFile.status === 'error' && (
                    <div className="error-indicator">
                      <AlertCircle size={20} />
                      <span className="error-text">{imageFile.error}</span>
                      <button 
                        onClick={() => retryUpload(imageFile.id)}
                        className="retry-btn"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Bouton de suppression */}
                <button
                  onClick={() => removeImage(imageFile.id)}
                  className="remove-btn"
                  disabled={imageFile.status === 'uploading'}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informations */}
      <div className="upload-info">
        <div className="stats">
          <span>{images.filter(img => img.status === 'success').length}/{maxImages} images</span>
          {images.some(img => img.status === 'uploading') && (
            <span className="uploading">Upload en cours...</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .upload-images {
          width: 100%;
        }

        .drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
          margin-bottom: 20px;
        }

        .drop-zone:hover:not(.disabled) {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .drop-zone.active {
          border-color: #2563eb;
          background: #eff6ff;
          transform: scale(1.02);
        }

        .drop-zone.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #6b7280;
        }

        .drop-content svg {
          color: #9ca3af;
        }

        .drop-content h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .drop-content p {
          margin: 0;
          font-size: 14px;
        }

        .format-info {
          margin-top: 8px;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .format-info small {
          color: #6b7280;
          font-size: 12px;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .image-item {
          position: relative;
        }

        .image-container {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .status-overlay.uploading {
          background: rgba(0, 0, 0, 0.7);
        }

        .status-overlay.success {
          background: rgba(34, 197, 94, 0.8);
        }

        .status-overlay.error {
          background: rgba(239, 68, 68, 0.8);
          padding: 8px;
          text-align: center;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 80%;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: white;
          transition: width 0.3s ease;
        }

        .error-text {
          font-size: 10px;
          text-align: center;
          margin-bottom: 4px;
        }

        .retry-btn {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          color: white;
          font-size: 10px;
          cursor: pointer;
        }

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .remove-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 1);
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 14px;
        }

        .stats {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .uploading {
          color: #2563eb;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default UploadImages;