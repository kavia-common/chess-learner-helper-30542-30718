/* eslint-disable import/no-extraneous-dependencies */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Reduce act() warnings flakiness in jsdom for timers and animations in smoke tests
// and ensure fetch is defined if any component accidentally calls it during render.
// We aim to avoid real network in tests but keep shims lightweight.
if (typeof global.fetch === 'undefined') {
  global.fetch = () =>
    Promise.reject(new Error('Network calls are disabled in tests. Mock fetch or related services.'));
}
