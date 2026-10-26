const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://shopping-8pfs.onrender.com' : '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
