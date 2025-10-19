import React from 'react';
import { screen } from '@testing-library/react';
import { AppRouter } from '../router/AppRouter';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('AppRouter - public routing', () => {
  test('renders Home on root path', () => {
    renderWithProviders(<AppRouter />, { routeEntries: ['/'] });
    // Home page likely has a heading; assert by role heading level 1
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings[0]).toHaveTextContent(/home|welcome/i);
  });

  test('renders NotFound on unknown route', () => {
    renderWithProviders(<AppRouter />, { routeEntries: ['/some/unknown/route'] });
    // NotFound page typically has text "Not Found" or 404
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/not\s*found|404/i);
  });

  test('navigates to Lessons list', () => {
    renderWithProviders(<AppRouter />, { routeEntries: ['/lessons'] });
    expect(screen.getByRole('heading', { name: /lessons/i })).toBeInTheDocument();
  });
});
