/**
 * @module ErrorBoundary
 * @description React ErrorBoundary component that catches runtime errors,
 * preventing blank screens and avoiding raw system stack traces in the UI.
 * Provides a high-contrast, accessible fallback interface.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Props accepted by the ErrorBoundary component.
 *
 * @property children - The child components to wrap and protect
 * @property fallbackMessage - Optional custom message for the error state
 */
interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallbackMessage?: string;
}

/**
 * Internal state of the ErrorBoundary component.
 *
 * @property hasError - Whether an error has been caught
 * @property errorDigest - A safe, user-facing error summary (no stack traces)
 */
interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly errorDigest: string;
}

/**
 * A React ErrorBoundary that catches unhandled runtime errors in the
 * component tree and renders a high-contrast, accessible fallback UI.
 *
 * Security: Stack traces are never exposed to the user interface.
 * Accessibility: Fallback uses semantic HTML, ARIA roles, and high-contrast colors.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorDigest: '',
    };
  }

  /**
   * Derives error state from a caught error.
   * Stack traces are intentionally excluded from the digest.
   *
   * @param error - The caught error object
   * @returns Updated state with a safe error digest
   */
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred';
    return {
      hasError: true,
      errorDigest: message,
    };
  }

  /**
   * Logs error details for debugging without exposing them to the UI.
   *
   * @param error - The caught error
   * @param errorInfo - React component stack information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    /* istanbul ignore next -- logging for dev debugging only */
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  /**
   * Resets the error state, allowing the user to retry.
   */
  private readonly handleRetry = (): void => {
    this.setState({ hasError: false, errorDigest: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#05070E',
            color: '#CBD5E1',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#0B1220',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '3rem',
              maxWidth: '480px',
              width: '100%',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
              aria-hidden="true"
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#F59E0B',
                marginBottom: '1rem',
              }}
            >
              System Error Detected
            </h1>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: '#CBD5E1',
                marginBottom: '0.5rem',
              }}
            >
              {this.props.fallbackMessage ??
                'The application encountered an unexpected error. No data has been lost.'}
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#64748B',
                marginBottom: '2rem',
              }}
            >
              Error reference: {this.state.errorDigest.substring(0, 80)}
            </p>
            <button
              onClick={this.handleRetry}
              aria-label="Retry loading the application"
              style={{
                background: 'linear-gradient(135deg, #00F5A0, #00D9F5)',
                color: '#05070E',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 160, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Retry
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
