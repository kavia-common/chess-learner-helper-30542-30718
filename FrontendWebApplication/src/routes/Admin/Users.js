import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// PUBLIC_INTERFACE
export default function Users() {
  /** Admin users management page. */
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getUsers();
        if (mounted) setUsers(Array.isArray(list) ? list : []);
      } catch {
        showToast('Failed to load users.', 'error', 4000);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showToast]);

  const onChangeRole = async (uid, role) => {
    try {
      await updateUserRole(uid, role);
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role } : u)));
      showToast('Role updated.', 'success', 2000);
    } catch {
      showToast('Unable to update role.', 'error', 4000);
    }
  };

  return (
    <div className="page" aria-labelledby="admin-users-title">
      <h1 id="admin-users-title">Users</h1>
      {loading && <p role="status">Loading users...</p>}
      {!loading && users.length === 0 && <p>No users found.</p>}
      {!loading && users.length > 0 && (
        <div className="responsive-table" role="region" aria-label="Users table">
          <table>
            <caption className="sr-only">Users list</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.displayName || '-'}</td>
                  <td>{u.email}</td>
                  <td>
                    <label className="sr-only" htmlFor={`role-${u.id}`}>Role for {u.email}</label>
                    <select
                      id={`role-${u.id}`}
                      value={u.role || 'user'}
                      onChange={(e) => onChangeRole(u.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{u.status || 'active'}</td>
                  <td>{u.createdAt || '-'}</td>
                  <td>
                    <button className="btn small" disabled title="More actions coming soon">Actions</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
