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


// Doctor API
export const doctorApi = {
  getAll: async (params?: { specialty?: string; city?: string; search?: string; includeUnverified?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const url = query ? `/doctors?${query}` : '/doctors';
    return fetch(buildApiUrl(url, false));
  },
  
  getById: async (id: string) => {
    return fetch(buildApiUrl(`/doctors/${id}`, false));
  },
  
  create: async (data: any, accessToken: string) => {
    return fetch(buildApiUrl('/doctors', false), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
  },
  
  update: async (id: string, data: any, accessToken: string) => {
    return fetch(buildApiUrl(`/doctors/${id}`, false), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
  },
  
  delete: async (id: string, accessToken: string) => {
    return fetch(buildApiUrl(`/doctors/${id}`, false), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    });
  },
  
  updateSchedule: async (id: string, schedules: any[], accessToken: string) => {
    return fetch(buildApiUrl(`/doctors/${id}/schedule`, false), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify({ schedules })
    });
  }
};

// Appointment API
export const appointmentApi = {
  create: async (data: any, accessToken: string) => {
    return fetch(buildApiUrl('/appointments', false), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
  },
  
  getMyAppointments: async (accessToken: string) => {
    return fetch(buildApiUrl('/appointments/my-appointments', false), {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    });
  },
  
  getDoctorAppointments: async (accessToken: string) => {
    return fetch(buildApiUrl('/appointments/doctor-appointments', false), {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    });
  },
  
  updateStatus: async (id: string, data: any, accessToken: string) => {
    return fetch(buildApiUrl(`/appointments/${id}`, false), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
  },
  
  cancel: async (id: string, accessToken: string) => {
    return fetch(buildApiUrl(`/appointments/${id}`, false), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    });
  }
};
