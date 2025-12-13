export const API_BASE_URL = 'http://localhost:5174/api/v1';
export const API_LEGACY_URL = 'http://localhost:5174/api';

export const buildApiUrl = (endpoint: string, useV1: boolean = true): string => {
  const baseUrl = useV1 ? API_BASE_URL : API_LEGACY_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  return fetch(buildApiUrl(endpoint), options);
};

export const patchRequest = async (
  endpoint: string,
  data: Record<string, any>,
  accessToken?: string
): Promise<Response> => {
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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  
  return fetch(buildApiUrl(endpoint), {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data)
  });
};
