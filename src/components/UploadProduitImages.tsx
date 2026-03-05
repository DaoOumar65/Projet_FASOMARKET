import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Edit3, Eye } from 'lucide-react';
import UploadImages from './UploadImages';

interface Props {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  showPreview?: boolean;
}

const UploadProduitImages: React.FC<Props> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
  showPreview = true
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageOrder, setImageOrder] = useState<string[]>(images);

  React.useEffect(() => {
    setImageOrder(images);
  }, [images]);

  const handleImagesChange = (newImages: string[]) => {
    setImageOrder(newImages);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    const newOrder = [...imageOrder];
    const [movedImage] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedImage);
    
    setImageOrder(newOrder);
    onImagesChange(newOrder);
  };

  const removeImage = (imageUrl: string) => {
    if (disabled) return;
    
    const newImages = imageOrder.filter(img => img !== imageUrl);
    setImageOrder(newImages);
    onImagesChange(newImages);
  };

  const setAsMainImage = (imageUrl: string) => {
    if (disabled) return;
    
    const newOrder = [imageUrl, ...imageOrder.filter(img => img !== imageUrl)];
    setImageOrder(newOrder);
    onImagesChange(newOrder);
  };

  return (
    <div className="upload-produit-images">
      <div className="upload-header">
        <div className="header-info">
          <h3>Images du produit</h3>
          <p>Ajoutez jusqu'à {maxImages} images de qualité pour présenter votre produit</p>
        </div>
        <div className="image-count">
          {imageOrder.length}/{maxImages}
        </div>
      </div>

      {/* Composant d'upload principal */}
      <UploadImages
        onImagesChange={handleImagesChange}
        maxImages={maxImages}
        maxSizePerImage={5}
        acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
        initialImages={images}
        disabled={disabled}
      />

      {/* Gestion de l'ordre des images */}
      {imageOrder.length > 1 && !disabled && (
        <div className="image-management">
          <h4>Organiser les images</h4>
          <p className="management-hint">
            <Camera size={14} />
            La première image sera l'image principale du produit
          </p>
          
          <div className="sortable-images">
            {imageOrder.map((imageUrl, index) => (
              <div key={imageUrl} className="sortable-image">
                <div className="image-wrapper">
                  <img src={imageUrl} alt={`Produit ${index + 1}`} />
                  
                  {index === 0 && (
                    <div className="main-badge">
                      <Camera size={12} />
                      Principal
                    </div>
                  )}
                  
                  <div className="image-actions">
                    <button
                      onClick={() => setSelectedImage(imageUrl)}
                      className="action-btn preview"
                      title="Prévisualiser"
                    >
                      <Eye size={14} />
                    </button>
                    
                    {index !== 0 && (
                      <button
                        onClick={() => setAsMainImage(imageUrl)}
                        className="action-btn main"
                        title="Définir comme image principale"
                      >
                        <Camera size={14} />
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeImage(imageUrl)}
                      className="action-btn remove"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="image-controls">
                  <button
                    onClick={() => moveImage(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="move-btn"
                  >
                    ←
                  </button>
                  <span className="position">#{index + 1}</span>
                  <button
                    onClick={() => moveImage(index, Math.min(imageOrder.length - 1, index + 1))}
                    disabled={index === imageOrder.length - 1}
                    className="move-btn"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils d'optimisation */}
      <div className="upload-tips">
        <h4>💡 Conseils pour de meilleures images</h4>
        <ul>
          <li>Utilisez un fond neutre et un bon éclairage</li>
          <li>Montrez le produit sous différents angles</li>
          <li>Incluez des détails importants (étiquettes, textures)</li>
          <li>Évitez les images floues ou trop sombres</li>
          <li>La première image sera celle affichée dans les listes</li>
        </ul>
      </div>

      {/* Modal de prévisualisation */}
      {selectedImage && showPreview && (
        <div className="preview-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Prévisualisation</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <img src={selectedImage} alt="Prévisualisation" />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setAsMainImage(selectedImage)}
                className="btn-main"
                disabled={imageOrder[0] === selectedImage}
              >
                <Camera size={16} />
                Définir comme principale
              </button>
              <button
                onClick={() => {
                  removeImage(selectedImage);
                  setSelectedImage(null);
                }}
                className="btn-remove"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .upload-produit-images {
          width: 100%;
        }

        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .header-info h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .header-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .image-count {
          background: #eff6ff;
          color: #2563eb;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 14px;
        }

        .image-management {
          margin-top: 24px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .image-management h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .management-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 16px 0;
          font-size: 13px;
          color: #6b7280;
        }

        .sortable-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
        }

        .sortable-image {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .image-wrapper {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          background: white;
        }

        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #2563eb;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .image-actions {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-wrapper:hover .image-actions {
          opacity: 1;
        }

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.preview {
          background: rgba(59, 130, 246, 0.9);
          color: white;
        }

        .action-btn.main {
          background: rgba(16, 185, 129, 0.9);
          color: white;
        }

        .action-btn.remove {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .image-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .move-btn {
          background: none;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
          color: #6b7280;
        }

        .move-btn:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
        }

        .move-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .position {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
        }

        .upload-tips {
          margin-top: 24px;
          padding: 16px;
          background: #fef7ff;
          border-radius: 8px;
          border: 1px solid #e879f9;
        }

        .upload-tips h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #86198f;
        }

        .upload-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #701a75;
        }

        .upload-tips li {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }

        .modal-body img {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          justify-content: flex-end;
        }

        .btn-main {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-main:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-remove {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default UploadProduitImages;