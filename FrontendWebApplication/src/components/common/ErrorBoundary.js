import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary
 * This component provides a top-level error boundary for the app.
 * It catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI with options to retry or go home.
 */
export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onReset: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.fallbackRef = React.createRef();
  }

  static getDerivedStateFromError(error) {
    // Update state for fallback render
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details - in real app this might be sent to a logging service
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps, prevState) {
    // Move focus to fallback for screen readers when error occurs
    if (!prevState.hasError && this.state.hasError && this.fallbackRef.current) {
      this.fallbackRef.current.focus();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null }, () => {
      if (typeof this.props.onReset === 'function') {
        this.props.onReset();
      }
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          ref={this.fallbackRef}
          style={{
            padding: '1rem',
            margin: '1rem',
            border: '2px solid var(--color-danger, #b00020)',
            borderRadius: '8px',
            background: 'var(--color-danger-bg, #fff5f5)',
            color: 'var(--color-danger-text, #7f1d1d)',
          }}
        >
          <h1 style={{ marginTop: 0 }}>Something went wrong.</h1>
          <p>We encountered an unexpected error while rendering this page.</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Technical details</summary>
              {String(this.state.error)}
              {'\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={this.handleReset}
              type="button"
              aria-label="Retry rendering"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--color-border, #ccc)',
                background: 'var(--color-surface, #fff)',
                color: 'var(--color-text, #111)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              aria-label="Go to home page"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--color-border, #ccc)',
                background: 'var(--color-surface, #fff)',
                color: 'var(--color-text, #111)',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
