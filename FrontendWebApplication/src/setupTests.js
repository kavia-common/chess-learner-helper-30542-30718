/* Testing Library setup:
 - Adds jest-dom matchers
 - Encourages best practices: preferByRole, accessible queries, and cleanup after each (handled by RTL)
 Docs: https://testing-library.com/docs/react-testing-library/intro/
*/
import '@testing-library/jest-dom';

// Tests run in Node (jsdom). The browser MSW worker initializes only in src/index.js
// when REACT_APP_USE_MOCKS=true and in development mode. No action required here.

// Avoid noisy React act warnings in strict mode during tests for async timers if needed
// jest.useFakeTimers(); // enable per-test when needed
