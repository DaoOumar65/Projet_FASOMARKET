export const getImageUrl = (imagePath?: string, defaultImage = '/default-shop.png'): string => {
  if (!imagePath) return defaultImage;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8081/api/files/view/${imagePath.split('/').pop()}`;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Veuillez sélectionner une image' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'L\'image ne doit pas dépasser 5MB' };
  }

  return { valid: true };
};