export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder-image.png"; // Ảnh mặc định nếu không có path
  
  if (path.startsWith("http")) return path;
  
  const baseUrl = import.meta.env.VITE_ASSET_URL || "http://localhost:8000";
  
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};