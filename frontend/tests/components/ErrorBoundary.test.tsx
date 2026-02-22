/**
 * ErrorBoundary Component Tests
 * Tests error handling and fallback UI
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No Error</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No Error')).toBeInTheDocument();
  });

  it('should render error fallback UI when child component throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should not render the child component
    expect(screen.queryByText('No Error')).not.toBeInTheDocument();
    
    // Should render error message - use getAllByText since there are multiple matches
    const errorElements = screen.getAllByText(/error/i);
    expect(errorElements.length).toBeGreaterThan(0);
  });
});
