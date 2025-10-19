import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary wraps app trees and shows a fallback UI when an error is thrown during rendering.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // hook for logging service (Sentry, etc.)
    // console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div role="alert" style={{ padding: 16, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8 }}>
          <strong>Something went wrong.</strong>
          <div style={{ marginTop: 8, color: '#92400e', fontSize: 14 }}>
            Please refresh the page or try again later.
          </div>
        </div>
      );
    }
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}
