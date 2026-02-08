// src/config/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function for API calls
export const apiUrl = (path: string) => `${API_URL}${path}`;

// Export for direct use if needed
export default API_URL;