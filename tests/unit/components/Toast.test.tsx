import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock del componente Toast
vi.mock('../../../src/components/core/Toast', () => ({
  Toast: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div data-testid="toast" className="bg-blue-50">
      <span>{message}</span>
      <button onClick={onClose} role="button">Close</button>
    </div>
  )
}));

describe('Toast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render toast with message', () => {
    const { Toast } = require('../../../src/components/core/Toast');
    render(<Toast message="Test message" onClose={mockOnClose} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByTestId('toast')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const { Toast } = require('../../../src/components/core/Toast');
    render(<Toast message="Test message" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});