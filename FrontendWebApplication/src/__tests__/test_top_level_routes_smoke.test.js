import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Onboarding from '../routes/Onboarding';
import NotFound from '../routes/NotFound';

describe('Top-level routes smoke', () => {
  function renderAt(route, element) {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={route} element={element} />
        </Routes>
      </MemoryRouter>
    );
  }

  test('Onboarding basic render at /onboarding', async () => {
    renderAt('/onboarding', <Onboarding />);
    const heading = await screen.findByRole('heading', { name: /onboarding|welcome|get started/i });
    expect(heading).toBeInTheDocument();
  });

  test('NotFound direct render shows not found messaging', async () => {
    renderAt('/whatever', <NotFound />);
    const text = await screen.findByText(/not found|page not found|404/i);
    expect(text).toBeInTheDocument();
  });
});
