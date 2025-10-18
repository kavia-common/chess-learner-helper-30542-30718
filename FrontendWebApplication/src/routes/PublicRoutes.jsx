import React from 'react';
import { Outlet } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function PublicRoutes() {
  /** Pass-through wrapper for public routes, reserved for future logic (e.g., redirect when logged in). */
  return <Outlet />;
}
