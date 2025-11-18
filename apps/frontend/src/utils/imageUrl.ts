// Utility function to get the correct image URL
// In production, images are served from the root (same origin)
// In development, we need to use the full API URL

export const getImageUrl = (imagePath: string | undefined): string => {
  console.log('[getImageUrl] Input:', imagePath);

  if (!imagePath) {
    console.log('[getImageUrl] No path provided, returning placeholder');
    return '/placeholder-product.jpg';
  }

  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('[getImageUrl] Full URL detected, returning as-is:', imagePath);
    return imagePath;
  }

  // In production, images are served from the same origin
  // In development, we need to prefix with the API host
  if (import.meta.env.PROD) {
    // Production: images are at /uploads/... on same origin
    // Garantir que comece com /
    const fullPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    console.log('[getImageUrl] Production mode, returning:', fullPath);
    return fullPath;
  }

  // Development: prefix with the API host
  const devUrl = `http://localhost:3001${imagePath}`;
  console.log('[getImageUrl] Development mode, returning:', devUrl);
  return devUrl;
};
