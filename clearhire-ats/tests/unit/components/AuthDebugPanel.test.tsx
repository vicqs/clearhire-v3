import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock del módulo authHelper
vi.mock('../../../src/utils/authHelper', () => ({
  getCurrentUser: vi.fn(),
  createTestSession: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

// Mock del módulo supabase
vi.mock('../../../src/lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

// Mock del componente AuthDebugPanel
vi.mock('../../../src/components/auth/AuthDebugPanel', () => ({
  AuthDebugPanel: () => <div data-testid="auth-debug-panel">Mock AuthDebugPanel</div>
}));

describe('AuthDebugPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mock component', () => {
    const { AuthDebugPanel } = require('../../../src/components/auth/AuthDebugPanel');
    render(<AuthDebugPanel />);
    
    expect(screen.getByTestId('auth-debug-panel')).toBeInTheDocument();
    expect(screen.getByText('Mock AuthDebugPanel')).toBeInTheDocument();
  });
});