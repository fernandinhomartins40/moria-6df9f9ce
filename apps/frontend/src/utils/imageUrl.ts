// Utility function to get the correct image URL
// In production, images are served from the root (same origin)
// In development, we need to use the full API URL

export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return '/placeholder-product.jpg';
  }

  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // In production, images are served from the same origin
  // In development, we need to prefix with the API host
  if (import.meta.env.PROD) {
    // Production: images are at /uploads/... on same origin
    return imagePath;
  }

  // Development: prefix with the API host
  return `http://localhost:3001${imagePath}`;
};
