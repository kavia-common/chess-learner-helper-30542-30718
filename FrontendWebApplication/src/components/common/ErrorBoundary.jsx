import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary is a class component to catch render-time errors and display a user-friendly message.
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
    // Log error to monitoring service here
    // console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div role="alert" style={{ padding: 16 }}>
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
