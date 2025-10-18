import React from 'react';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export default function Profile() {
  /** Displays basic profile info from auth context. */
  const { user } = useAuth();
  return (
    <section>
      <h1>Profile</h1>
      {!user ? <p>Loading...</p> : (
        <div>
          <p>Email: {user.email}</p>
          <p>Role: {user.role || 'user'}</p>
        </div>
      )}
    </section>
  );
}
