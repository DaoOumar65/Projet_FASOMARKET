export const uploadShopImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8081/api/files/upload-shop-image', {
    method: 'POST',
    headers: {
      'X-User-Id': localStorage.getItem('userId') || '',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    },
    body: formData
  });
  
  return response.json();
};