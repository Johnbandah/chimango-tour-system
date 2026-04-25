// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
  if (imagePath.startsWith('./')) return imagePath.substring(1);
  return imagePath;
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return `USD ${amount?.toLocaleString() || 0}`;
};

// Helper function to format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};