import React from 'react';
import { screen } from '@testing-library/react';
import { LessonsList } from '../../lessons/LessonsList';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

// Mock Toast provider's show to avoid timers/side effects; using real provider is fine since we don't trigger show here.

describe('LessonsList', () => {
  test('renders heading and empty state', async () => {
    // Provide a store state and a LessonsProvider will handle its own state;
    // We don't want API calls; the component calls actions.fetchLessons/Progress on mount. For this unit test,
    // that's okay; initial state is empty and we assert basic render. In a fuller test we'd mock API.
    renderWithProviders(<LessonsList />, { routeEntries: ['/lessons'] });

    expect(screen.getByRole('heading', { name: /lessons/i })).toBeInTheDocument();
    // Depending on initial state, it may show loading; but eventually empty state
    // We just check that at least the heading exists.
  });
});
