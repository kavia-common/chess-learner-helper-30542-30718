import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

// PUBLIC_INTERFACE
export default function ContentManager() {
  /**
   * ContentManager provides stubbed UI for managing lesson content.
   * Uses adminApi stubs to demonstrate no-backend graceful behavior.
   */
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminApi.listContent()
      .then((items) => { if (mounted) setContents(items); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <section>
      <h2>Content Manager</h2>
      {loading ? <p>Loading content…</p> : (
        <>
          <button onClick={() => alert('Create Content - stubbed')}>Create New</button>
          <ul>
            {contents.map(c => (
              <li key={c.id} style={{ margin: '0.5rem 0' }}>
                <strong>{c.title}</strong> — {c.status}
                <div style={{ marginTop: '0.25rem' }}>
                  <button onClick={() => alert(`Edit ${c.id} - stubbed`)} style={{ marginRight: '0.5rem' }}>Edit</button>
                  <button onClick={() => alert(`Delete ${c.id} - stubbed`)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          {contents.length === 0 && !loading && <p>No content available.</p>}
        </>
      )}
    </section>
  );
}
