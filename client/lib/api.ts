// Check if we're in demo mode (static deployment without backend)
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Debug: Log demo mode status
console.log('🔍 Demo Mode Check:', {
  isDemoMode,
  MODE: import.meta.env.MODE,
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD
});

export const API_BASE_URL = isDemoMode ? 'DEMO_MODE' : 'http://localhost:5174/api/v1';
export const API_LEGACY_URL = isDemoMode ? 'DEMO_MODE' : 'http://localhost:5174/api';

export const buildApiUrl = (endpoint: string, useV1: boolean = true): string => {
  if (isDemoMode) {
    return `demo://${endpoint}`;
  }
  const baseUrl = useV1 ? API_BASE_URL : API_LEGACY_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  if (isDemoMode) {
    // Import demo API dynamically
    const demoApi = await import('../demo/api');
    return demoApi.apiFetch(endpoint, options);
  }
  return fetch(buildApiUrl(endpoint), options);
};

export const patchRequest = async (
  endpoint: string,
  data: Record<string, any>,
  accessToken?: string
): Promise<Response> => {
  if (isDemoMode) {
    const demoApi = await import('../demo/api');
    return demoApi.patchRequest(endpoint, data, accessToken);
  }
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  
  return fetch(buildApiUrl(endpoint), {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(data)
  });
};

export const putRequest = async (
  endpoint: string,
  data: Record<string, any>,
  accessToken?: string
): Promise<Response> => {
  if (isDemoMode) {
    const demoApi = await import('../demo/api');
    return demoApi.putRequest(endpoint, data, accessToken);
  }
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  
  return fetch(buildApiUrl(endpoint), {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data)
  });
};
