import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

// PUBLIC_INTERFACE
export default function UsersManager() {
  /**
   * UsersManager provides a stubbed user list with role assignment and basic actions.
   * Uses adminApi for graceful no-backend behavior.
   */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    adminApi.listUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const onSetRole = async (id, role) => {
    await adminApi.setUserRole(id, role);
    refresh();
  };

  return (
    <section>
      <h2>Users Manager</h2>
      {loading ? <p>Loading users…</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Email</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Role</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: '0.5rem 0' }}>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <select
                    aria-label={`Set role for ${u.email}`}
                    value={u.role}
                    onChange={(e) => onSetRole(u.id, e.target.value)}
                  >
                    <option value="learner">learner</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '0.75rem 0' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
