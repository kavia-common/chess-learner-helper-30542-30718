import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Register } from '../../auth/Register';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import * as authApi from '../../../api/authApi';

jest.mock('../../../api/authApi');

describe('Register page', () => {
  test('validates inputs and submits happy path', async () => {
    authApi.register.mockResolvedValueOnce({ ok: true });

    renderWithProviders(<Register />, { routeEntries: ['/register'] });

    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'new@user.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password1');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Should not show validation errors
    expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
    expect(authApi.register).toHaveBeenCalled();
  });

  test('shows API error', async () => {
    authApi.register.mockRejectedValueOnce(new Error('Email already in use'));

    renderWithProviders(<Register />, { routeEntries: ['/register'] });

    await userEvent.type(screen.getByLabelText(/email/i), 'taken@user.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password1');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/already in use/i);
  });

  test('client-side validation errors appear', async () => {
    renderWithProviders(<Register />, { routeEntries: ['/register'] });

    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'short'); // weak
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    // Validation messages
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument();
    expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
  });
});
