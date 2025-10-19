import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

// PUBLIC_INTERFACE
export default function AuditLog() {
  /**
   * AuditLog shows a stubbed list of admin actions with filtering.
   */
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  const refresh = () => {
    adminApi.getAuditLogs({ q: filter }).then(setLogs);
  };

  useEffect(() => { refresh(); }, []); // initial load

  return (
    <section>
      <h2>Audit Log</h2>
      <div style={{ marginBottom: '0.75rem' }}>
        <input
          placeholder="Filter by keyword"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={refresh}>Apply</button>
      </div>
      <ul>
        {logs.map((log) => (
          <li key={log.id} style={{ margin: '0.4rem 0' }}>
            <span style={{ color: '#666' }}>{new Date(log.ts).toLocaleString()} — </span>
            <strong>{log.actor}</strong> {log.action} <em>{log.target}</em>
          </li>
        ))}
        {logs.length === 0 && <li>No logs match the current filter.</li>}
      </ul>
    </section>
  );
}
