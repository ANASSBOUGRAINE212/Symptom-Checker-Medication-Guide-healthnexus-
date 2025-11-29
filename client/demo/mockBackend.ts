import { mockDiseases, mockMedications } from './mockData';

const STORAGE_KEYS = {
  USER: 'demo_user',
  TOKEN: 'demo_token',
  DIAGNOSES: 'demo_diagnoses',
  PROFILE: 'demo_profile'
};

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
}

interface MockDiagnosis {
  id: string;
  userId: string;
  symptoms: string[];
  possibleDiseases: Array<{
    disease: typeof mockDiseases[0];
    matchPercentage: number;
    matchedSymptoms: string[];
  }>;
  notes?: string;
  createdAt: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockBackend {
  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private static getCurrentUser(): MockUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  private static setCurrentUser(user: MockUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_token_' + user.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  static async register(email: string, password: string, name: string) {
    await delay(500);
    
    const user: MockUser = {
      id: this.generateId(),
      email: email.toLowerCase(),
      name,
      role: email.toLowerCase() === 'admin@demo.com' ? 'ADMIN' : 'USER',
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    this.setCurrentUser(user);

    return {
      user,
      accessToken: 'mock_token_' + user.id,
      refreshToken: 'mock_refresh_' + user.id
    };
  }

  static async login(email: string, password: string) {
    await delay(500);

    const user: MockUser = {
      id: this.generateId(),
      email: email.toLowerCase(),
      name: email.split('@')[0],
      role: email.toLowerCase() === 'admin@demo.com' ? 'ADMIN' : 'USER',
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    this.setCurrentUser(user);

    return {
      user,
      accessToken: 'mock_token_' + user.id,
      refreshToken: 'mock_refresh_' + user.id
    };
  }

  static async logout() {
    await delay(300);
    this.setCurrentUser(null);
    return { message: 'Logged out successfully' };
  }

  static async getCurrentUserProfile() {
    await delay(300);
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const profileStr = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const profile = profileStr ? JSON.parse(profileStr) : {};

    return {
      ...user,
      ...profile
    };
  }

  static async updateProfile(data: any) {
    await delay(400);
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const profileStr = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const profile = profileStr ? JSON.parse(profileStr) : {};

    const updatedProfile = { ...profile, ...data };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

    return {
      ...user,
      ...updatedProfile
    };
  }

  static async createDiagnosis(symptoms: string[], notes?: string) {
    await delay(800);
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const matchedDiseases = mockDiseases
      .map(disease => {
        const matchedSymptoms = symptoms.filter(symptom =>
          disease.symptoms.some(ds => 
            ds.toLowerCase().includes(symptom.toLowerCase()) ||
            symptom.toLowerCase().includes(ds.toLowerCase())
          )
        );
        const matchPercentage = Math.round((matchedSymptoms.length / symptoms.length) * 100);
        
        return {
          disease,
          matchPercentage,
          matchedSymptoms
        };
      })
      .filter(match => match.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);

    const diagnosis: MockDiagnosis = {
      id: this.generateId(),
      userId: user.id,
      symptoms,
      possibleDiseases: matchedDiseases,
      notes,
      createdAt: new Date().toISOString()
    };

    const diagnosesStr = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    const diagnoses = diagnosesStr ? JSON.parse(diagnosesStr) : [];
    diagnoses.unshift(diagnosis);
    localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(diagnoses));

    return diagnosis;
  }

  static async getDiagnoses() {
    await delay(400);
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const diagnosesStr = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    return diagnosesStr ? JSON.parse(diagnosesStr) : [];
  }

  static async getDiagnosisById(id: string) {
    await delay(300);
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const diagnosesStr = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    const diagnoses = diagnosesStr ? JSON.parse(diagnosesStr) : [];
    const diagnosis = diagnoses.find((d: MockDiagnosis) => d.id === id);
    
    if (!diagnosis) throw new Error('Diagnosis not found');
    return diagnosis;
  }

  static async deleteDiagnosis(id: string) {
    await delay(300);
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const diagnosesStr = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    const diagnoses = diagnosesStr ? JSON.parse(diagnosesStr) : [];
    const filtered = diagnoses.filter((d: MockDiagnosis) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(filtered));

    return { message: 'Diagnosis deleted' };
  }

  static async getDiseases(params?: any) {
    await delay(400);
    return mockDiseases;
  }

  static async getMedications(params?: any) {
    await delay(400);
    return mockMedications;
  }

  static async createDisease(data: any) {
    await delay(500);
    const user = this.getCurrentUser();
    if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

    return {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static async updateDisease(id: string, data: any) {
    await delay(500);
    const user = this.getCurrentUser();
    if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  static async deleteDisease(id: string) {
    await delay(400);
    const user = this.getCurrentUser();
    if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

    return { message: 'Disease deleted' };
  }

  static async createMedication(data: any) {
    await delay(500);
    const user = this.getCurrentUser();
    if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

    return {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static async updateMedication(id: string, data: any) {
    await delay(500);
    const user = this.getCurrentUser();
    if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  static async deleteMedication(id: string) {
    await delay(400);
    const user = this.getCurrentUser();
    if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');

    return { message: 'Medication deleted' };
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  static getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
}
