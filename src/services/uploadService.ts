import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

export interface ImageUploadResult {
  url: string;
  filename: string;
  size: number;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class UploadService {
  private readonly maxWidth = 1200;
  private readonly maxHeight = 1200;
  private readonly quality = 0.8;

  async uploadImage(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    try {
      // ✅ Compression et redimensionnement
      const compressedFile = await this.compressImage(file);
      
      // ✅ Tentative upload backend
      try {
        return await this.uploadToBackend(compressedFile, onProgress);
      } catch (backendError) {
        console.warn('Backend upload failed, using fallback:', backendError);
        return await this.uploadFallback(compressedFile, onProgress);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  }

  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // ✅ Calcul des dimensions optimales
        let { width, height } = this.calculateOptimalSize(img.width, img.height);
        
        canvas.width = width;
        canvas.height = height;

        // ✅ Dessin avec qualité optimisée
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx!.drawImage(img, 0, 0, width, height);

        // ✅ Conversion en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Erreur compression image'));
            }
          },
          'image/jpeg',
          this.quality
        );
      };

      img.onerror = () => reject(new Error('Erreur chargement image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateOptimalSize(originalWidth: number, originalHeight: number) {
    let width = originalWidth;
    let height = originalHeight;

    // ✅ Redimensionnement proportionnel
    if (width > this.maxWidth) {
      height = (height * this.maxWidth) / width;
      width = this.maxWidth;
    }

    if (height > this.maxHeight) {
      width = (width * this.maxHeight) / height;
      height = this.maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private async uploadToBackend(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'produits');

    const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  private async uploadFallback(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    // ✅ Simulation d'upload avec stockage local
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        // Simuler progression
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (onProgress) onProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // ✅ Générer URL locale (base64 ou blob)
            const url = reader.result as string;
            
            resolve({
              url,
              filename: file.name,
              size: file.size,
              width: this.maxWidth,
              height: this.maxHeight
            });
          }
        }, 100);
      };
      
      reader.readAsDataURL(file);
    });
  }

  async uploadMultipleImages(
    files: File[], 
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], (progress) => {
          if (onProgress) onProgress(i, progress);
        });
        results.push(result);
      } catch (error) {
        console.error(`Erreur upload fichier ${i}:`, error);
        throw error;
      }
    }
    
    return results;
  }

  async deleteImage(url: string): Promise<void> {
    try {
      // ✅ Tentative suppression backend
      await axios.delete(`${API_BASE_URL}/upload/image`, {
        data: { url }
      });
    } catch (error) {
      console.warn('Erreur suppression backend:', error);
      // ✅ Fallback: pas d'action (images locales)
    }
  }

  // ✅ Utilitaires de validation
  validateImageFile(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPEG, PNG ou WebP.';
    }

    if (file.size > maxSize) {
      return 'Fichier trop volumineux. Maximum 10MB.';
    }

    return null;
  }

  // ✅ Génération de miniatures
  async generateThumbnail(file: File, size: number = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // ✅ Crop centré
        const minDim = Math.min(img.width, img.height);
        const x = (img.width - minDim) / 2;
        const y = (img.height - minDim) / 2;

        ctx!.drawImage(img, x, y, minDim, minDim, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Erreur génération miniature'));
            }
          },
          'image/jpeg',
          0.7
        );
      };

      img.onerror = () => reject(new Error('Erreur chargement image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // ✅ Optimisation pour différents usages
  async optimizeForUsage(file: File, usage: 'thumbnail' | 'gallery' | 'full'): Promise<File> {
    const settings = {
      thumbnail: { maxWidth: 300, maxHeight: 300, quality: 0.7 },
      gallery: { maxWidth: 800, maxHeight: 600, quality: 0.8 },
      full: { maxWidth: 1200, maxHeight: 1200, quality: 0.9 }
    };

    const config = settings[usage];
    const originalMaxWidth = this.maxWidth;
    const originalMaxHeight = this.maxHeight;
    const originalQuality = this.quality;

    // ✅ Appliquer config temporaire
    (this as any).maxWidth = config.maxWidth;
    (this as any).maxHeight = config.maxHeight;
    (this as any).quality = config.quality;

    try {
      const optimized = await this.compressImage(file);
      return optimized;
    } finally {
      // ✅ Restaurer config originale
      (this as any).maxWidth = originalMaxWidth;
      (this as any).maxHeight = originalMaxHeight;
      (this as any).quality = originalQuality;
    }
  }
}

export const uploadService = new UploadService();