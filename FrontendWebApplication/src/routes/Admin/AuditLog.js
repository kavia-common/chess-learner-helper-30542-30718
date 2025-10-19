import React, { useEffect, useState } from 'react';
import { getAuditLog } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// PUBLIC_INTERFACE
export default function AuditLog() {
  /** Admin audit log with paging. */
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState({ items: [], page: 1, pageSize: 20, total: 0 });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAuditLog({ page, pageSize: log.pageSize });
      setLog(res || { items: [], page, pageSize: 20, total: 0 });
    } catch {
      showToast('Failed to load audit log.', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const totalPages = Math.max(1, Math.ceil((log.total || log.items.length) / (log.pageSize || 20)));

  return (
    <div className="page" aria-labelledby="admin-audit-title">
      <h1 id="admin-audit-title">Audit Log</h1>
      {loading && <p role="status">Loading audit log...</p>}
      {!loading && (log.items || []).length === 0 && <p>No audit entries.</p>}
      {!loading && (log.items || []).length > 0 && (
        <>
          <div className="responsive-table" role="region" aria-label="Audit entries table">
            <table>
              <caption className="sr-only">Audit log entries</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Action</th>
                  <th scope="col">Target</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {log.items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.at}</td>
                    <td>{i.actor}</td>
                    <td>{i.action}</td>
                    <td>{i.target}</td>
                    <td>{i.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav aria-label="Audit log pagination" style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn small" onClick={() => load(Math.max(1, (log.page || 1) - 1))} disabled={(log.page || 1) <= 1} aria-label="Previous page">Prev</button>
            <span aria-live="polite">Page {log.page || 1} of {totalPages}</span>
            <button className="btn small" onClick={() => load(Math.min(totalPages, (log.page || 1) + 1))} disabled={(log.page || 1) >= totalPages} aria-label="Next page">Next</button>
          </nav>
        </>
      )}
    </div>
  );
}
