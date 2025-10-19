# Frontend Web Application

This project was bootstrapped with Create React App.

## Accessibility and UX Enhancements

- Global ErrorBoundary wraps the app layout and announces errors with role="alert".
- High-contrast toggle is available in Navbar via ThemeContext; it switches CSS variables via data-contrast="high".
- Focus outlines use semantic variables and are visible for keyboard users.
- Toasts:
  - Accessible Toast component with role="alert" for errors and role="status" for others.
  - Dismiss with click or keyboard (Enter/Space/Escape).
  - Auto-dismiss after duration (default 4s).
- Modal:
  - Accessible `<Modal>` component with focus trap and ESC close (see `src/components/common/Modal.js`).
  - aria-modal="true", role="dialog", requires ariaLabel.
- Loading:
  - Reusable `<Skeleton>` component used across Lessons, History, Challenges.
- Empty State:
  - Reusable `<EmptyState>` for lists with no data, with optional action.
- ARIA and Keyboard:
  - Navbar/Sidebar links have labels.
  - Chess Board squares have aria-labels and keyboard navigation with arrow keys, Enter/Space to select.

## Using Toasts

- Import and call `const { showToast } = useToast();`
- `showToast('Saved!', 'success', 3000)` will show a success toast for 3s.

## High Contrast

- Toggle via Navbar button or programmatically with ThemeContext's `toggleContrast`.
- Applies semantic color variables and clearer outlines across the app.
