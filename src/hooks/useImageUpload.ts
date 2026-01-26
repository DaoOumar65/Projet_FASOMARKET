import { useState } from 'react';
import axios from 'axios';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const MAX_IMAGES = 10;

  const uploadImage = async (file: File, type: 'produits' | 'boutiques' = 'produits'): Promise<string> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await axios.post(
        'http://localhost:8081/api/upload/image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data.url;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, MAX_IMAGES };
};
