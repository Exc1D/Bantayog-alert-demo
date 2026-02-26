import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws error when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BrokenComponent = () => {
      const { addToast } = useToast();
      return <div>{addToast}</div>;
    };

    expect(() => render(<BrokenComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleError.mockRestore();
  });

  it('provides addToast function within provider', () => {
    const TestComponent = () => {
      const { addToast } = useToast();
      return <div data-testid="has-addtoast">{typeof addToast}</div>;
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('has-addtoast').textContent).toBe('function');
  });

  it('renders ToastProvider with children', () => {
    const TestComponent = () => <div>Child content</div>;

    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(container.textContent).toContain('Child content');
  });
});
