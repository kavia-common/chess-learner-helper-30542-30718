import { render, screen } from '@testing-library/react';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';

test('renders navbar and home content', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /welcome to chess learner helper/i })).toBeInTheDocument();
});
