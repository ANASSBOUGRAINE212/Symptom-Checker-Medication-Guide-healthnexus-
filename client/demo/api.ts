import { MockBackend } from './mockBackend';

export const API_BASE_URL = 'DEMO_MODE';
export const API_LEGACY_URL = 'DEMO_MODE';

export const buildApiUrl = (endpoint: string, useV1: boolean = true): string => {
  return `demo://${endpoint}`;
};

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : undefined;

  try {
    let data;

    if (endpoint.includes('/auth/register')) {
      data = await MockBackend.register(body.email, body.password, body.name);
    } else if (endpoint.includes('/auth/login')) {
      data = await MockBackend.login(body.email, body.password);
    } else if (endpoint.includes('/auth/logout')) {
      data = await MockBackend.logout();
    } else if (endpoint.includes('/auth/me')) {
      data = await MockBackend.getCurrentUserProfile();
    } else if (endpoint.includes('/users/profile') && method === 'PATCH') {
      data = await MockBackend.updateProfile(body);
    } else if (endpoint.includes('/users/profile') && method === 'PUT') {
      data = await MockBackend.updateProfile(body);
    } else if (endpoint.includes('/diagnoses') && method === 'POST') {
      data = await MockBackend.createDiagnosis(body.symptoms, body.notes);
    } else if (endpoint.match(/\/diagnoses\/[^/]+$/) && method === 'GET') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.getDiagnosisById(id!);
    } else if (endpoint.match(/\/diagnoses\/[^/]+$/) && method === 'DELETE') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.deleteDiagnosis(id!);
    } else if (endpoint.includes('/diagnoses')) {
      data = await MockBackend.getDiagnoses();
    } else if (endpoint.includes('/diseases') && method === 'POST') {
      data = await MockBackend.createDisease(body);
    } else if (endpoint.match(/\/diseases\/[^/]+$/) && method === 'PATCH') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.updateDisease(id!, body);
    } else if (endpoint.match(/\/diseases\/[^/]+$/) && method === 'DELETE') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.deleteDisease(id!);
    } else if (endpoint.includes('/diseases')) {
      data = await MockBackend.getDiseases();
    } else if (endpoint.includes('/medications') && method === 'POST') {
      data = await MockBackend.createMedication(body);
    } else if (endpoint.match(/\/medications\/[^/]+$/) && method === 'PATCH') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.updateMedication(id!, body);
    } else if (endpoint.match(/\/medications\/[^/]+$/) && method === 'DELETE') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.deleteMedication(id!);
    } else if (endpoint.includes('/medications')) {
      data = await MockBackend.getMedications();
    } else if (endpoint.includes('/user/diagnosis') && method === 'POST') {
      data = await MockBackend.createDiagnosis(body.symptoms, body.notes);
    } else if (endpoint.includes('/user/profile') && (method === 'PUT' || method === 'PATCH')) {
      data = await MockBackend.updateProfile(body);
    } else if (endpoint.includes('/user/profile')) {
      data = await MockBackend.getCurrentUserProfile();
    } else if (endpoint.includes('/user/diagnosis/stats')) {
      data = { diagnosisCount: 0, lastDiagnosis: null, recentActivities: [] };
    } else if (endpoint.includes('/user/diagnoses')) {
      const diagnoses = await MockBackend.getDiagnoses();
      data = { diagnoses, pagination: { page: 1, limit: 10, total: diagnoses.length, totalPages: 1 } };
    } else if (endpoint.match(/\/user\/diagnosis\/[^/]+$/) && method === 'DELETE') {
      const id = endpoint.split('/').pop();
      data = await MockBackend.deleteDiagnosis(id!);
    } else if (endpoint.match(/\/user\/diagnosis\/[^/]+$/)) {
      const id = endpoint.split('/').pop();
      data = { diagnosis: await MockBackend.getDiagnosisById(id!) };
    } else if (endpoint.includes('/admin/diseases')) {
      data = await MockBackend.getDiseases();
    } else if (endpoint.includes('/admin/medications')) {
      data = await MockBackend.getMedications();
    } else if (endpoint.includes('/admin/stats')) {
      data = { totalDiseases: 10, totalMedications: 15, totalUsers: 1, totalDiagnoses: 0, recentActivity: 0 };
    } else {
      throw new Error('Endpoint not implemented in demo mode');
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('Unauthorized') ? 403 : 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const patchRequest = async (
  endpoint: string,
  data: Record<string, any>,
  accessToken?: string
): Promise<Response> => {
  return apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const putRequest = async (
  endpoint: string,
  data: Record<string, any>,
  accessToken?: string
): Promise<Response> => {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};
