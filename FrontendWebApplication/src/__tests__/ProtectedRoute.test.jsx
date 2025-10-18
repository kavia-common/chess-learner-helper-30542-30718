import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

function ProtectedContent() {
  return <div>Secret</div>;
}

test('redirects unauthenticated users to login', () => {
  render(
    <MemoryRouter initialEntries={['/secret']}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<ProtectedContent />} />
          </Route>
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/login page/i)).toBeInTheDocument();
});
