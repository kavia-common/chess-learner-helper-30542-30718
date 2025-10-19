import React, { useEffect, useState } from 'react';
import { listReports, resolveReport } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// PUBLIC_INTERFACE
export default function Moderation() {
  /** Admin moderation page listing reports and basic resolution actions. */
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await listReports();
        if (mounted) setReports(Array.isArray(list) ? list : []);
      } catch {
        showToast('Failed to load reports.', 'error', 4000);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showToast]);

  const act = async (id, action) => {
    try {
      await resolveReport(id, action);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved', action } : r)));
      showToast('Report resolved.', 'success', 2000);
    } catch {
      showToast('Action failed.', 'error', 4000);
    }
  };

  return (
    <div className="page" aria-labelledby="admin-moderation-title">
      <h1 id="admin-moderation-title">Moderation</h1>
      {loading && <p role="status">Loading reports...</p>}
      {!loading && reports.length === 0 && <p>No reports.</p>}
      {!loading && reports.length > 0 && (
        <div className="responsive-table" role="region" aria-label="Reports table">
          <table>
            <caption className="sr-only">Reports list</caption>
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Reason</th>
                <th scope="col">Target</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td>{r.reason}</td>
                  <td>{r.targetId}</td>
                  <td>{r.status}</td>
                  <td>{r.createdAt || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn small" onClick={() => act(r.id, 'dismiss')}>Dismiss</button>
                      <button className="btn small" onClick={() => act(r.id, 'warn')}>Warn</button>
                      <button className="btn small" onClick={() => act(r.id, 'remove')}>Remove</button>
                    </div>
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
