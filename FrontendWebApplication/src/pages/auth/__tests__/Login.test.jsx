import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../auth/Login';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import * as authApi from '../../../api/authApi';

// Mock the authApi to avoid real HTTP
jest.mock('../../../api/authApi');

describe('Login page', () => {
  test('renders form and submits successfully (happy path)', async () => {
    authApi.login.mockResolvedValueOnce({ user: { id: '1', email: 'a@b.com' }, token: 't' });

    const { storeValue } = renderWithProviders(<Login />, {
      routeEntries: ['/login'],
    });

    const email = screen.getByLabelText(/email/i);
    const pwd = screen.getByLabelText(/password/i);
    const btn = screen.getByRole('button', { name: /login/i });

    await userEvent.type(email, 'a@b.com');
    await userEvent.type(pwd, 'secret123');

    await userEvent.click(btn);

    // The hook triggers dispatch on success; ensure no error alert is shown
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    // Confirm state would be updated by reducer via action creators; we can simulate by calling login action
    expect(authApi.login).toHaveBeenCalledWith('a@b.com', 'secret123');
    expect(storeValue).toBeDefined();
  });

  test('shows error when API rejects', async () => {
    authApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithProviders(<Login />, { routeEntries: ['/login'] });

    await userEvent.type(screen.getByLabelText(/email/i), 'bad@user.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error alert to appear
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/invalid credentials/i);
  });
});
