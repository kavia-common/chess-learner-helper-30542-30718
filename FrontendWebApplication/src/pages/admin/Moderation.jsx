import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

// PUBLIC_INTERFACE
export default function Moderation() {
  /**
   * Moderation shows a stubbed queue of flagged items with approve/reject actions.
   */
  const [queue, setQueue] = useState([]);

  const refresh = () => {
    adminApi.getModerationQueue().then(setQueue);
  };

  useEffect(() => { refresh(); }, []);

  const act = async (id, action) => {
    await adminApi.moderateItem(id, action);
    refresh();
  };

  return (
    <section>
      <h2>Moderation</h2>
      <ul>
        {queue.map(item => (
          <li key={item.id} style={{ margin: '0.5rem 0' }}>
            <div><strong>{item.type}</strong>: {item.summary}</div>
            <div style={{ marginTop: '0.25rem' }}>
              <button onClick={() => act(item.id, 'approve')} style={{ marginRight: '0.5rem' }}>Approve</button>
              <button onClick={() => act(item.id, 'reject')}>Reject</button>
            </div>
          </li>
        ))}
        {queue.length === 0 && <li>No flagged items in the queue.</li>}
      </ul>
    </section>
  );
}
