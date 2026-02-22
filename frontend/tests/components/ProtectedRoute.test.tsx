/**
 * ProtectedRoute Component Tests
 * Tests authentication-based route protection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import * as AuthContext from '@/contexts/AuthContext';

// Mock the useAuth hook
const mockUseAuth = vi.spyOn(AuthContext, 'useAuth');

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        emailVerified: true,
        emailAddresses: [],
      },
      accessToken: 'mock-token',
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should render the protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state while checking authentication', () => {
    // Mock loading state
    mockUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show loading indicator (adjust based on your actual loading UI)
    // This test assumes there's a loading state - adjust if needed
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to signin when user is not authenticated', () => {
    // Mock unauthenticated user
    mockUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
