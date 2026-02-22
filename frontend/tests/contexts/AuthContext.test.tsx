/**
 * AuthContext Tests
 * Tests authentication state management and API interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { mockUser, mockLoginResponse, mockRegisterResponse } from '../mocks/mockData';
import { ReactNode } from 'react';

// Mock the API module
vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '@/lib/api';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should start with no user and loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from localStorage if token exists', async () => {
      // Set token in localStorage
      localStorage.setItem('accessToken', 'existing-token');

      // Mock successful user fetch
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { user: mockUser } }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Login', () => {
    it('should successfully login user', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse,
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(result.current.accessToken).toBe(mockLoginResponse.accessToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe(mockLoginResponse.accessToken);
    });

    it('should throw error on failed login', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Register', () => {
    it('should successfully register user', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegisterResponse,
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const response = await result.current.register(
        'test@example.com',
        'password123',
        'John',
        'Doe'
      );

      expect(response).toEqual(mockRegisterResponse);
    });

    it('should throw error on failed registration', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.register('test@example.com', 'password123')
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('Logout', () => {
    it('should clear user state and localStorage on logout', async () => {
      // Setup authenticated state
      localStorage.setItem('accessToken', 'test-token');
      
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { user: mockUser } }),
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Mock logout API call
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });
});
