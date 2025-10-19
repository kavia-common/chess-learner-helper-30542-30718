import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chessboard } from '../Chessboard';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

describe('Chessboard', () => {
  test('fires onMove when selecting from and to via keyboard', async () => {
    const onMove = jest.fn();
    renderWithProviders(<Chessboard onMove={onMove} />, { routeEntries: ['/games/ai'] });

    // Focus the grid
    const grid = screen.getByRole('grid', { name: /chessboard/i });
    grid.focus();

    // Default focus is a1 (bottom-left). Press Enter to select from, then ArrowRight twice to move to c1 and select to
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await userEvent.keyboard('{Enter}');

    expect(onMove).toHaveBeenCalled();
    const call = onMove.mock.calls[0][0];
    // from should be a1, to should be c1
    expect(call).toEqual(expect.objectContaining({ from: 'a1', to: 'c1' }));
  });
});
