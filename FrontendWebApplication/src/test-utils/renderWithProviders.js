import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider, initialState } from '../store';
import { LessonsProvider } from '../store/lessons';
import { ToastProvider } from '../components/common/Toast';

/**
 * PUBLIC_INTERFACE
 * renderWithProviders
 * Renders a component wrapped with MemoryRouter, StoreProvider, LessonsProvider, and ToastProvider.
 * - routeEntries: array of route entries for MemoryRouter initialEntries
 * - storeValue: an object { state, dispatch } to be provided to StoreProvider; default uses initialState and a no-op dispatch
 * - wrapperProps: allows customizing providers if needed
 */
export function renderWithProviders(
  ui,
  {
    routeEntries = ['/'],
    storeValue = { state: initialState, dispatch: () => {} },
    wrapperProps = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <StoreProvider value={storeValue}>
        <LessonsProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={routeEntries}>{children}</MemoryRouter>
          </ToastProvider>
        </LessonsProvider>
      </StoreProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    storeValue,
  };
}
