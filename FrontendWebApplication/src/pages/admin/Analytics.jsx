import React, { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';

// PUBLIC_INTERFACE
export default function Analytics() {
  /**
   * Analytics displays stubbed platform metrics from adminApi.
   */
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setMetrics);
  }, []);

  return (
    <section>
      <h2>Analytics</h2>
      {!metrics ? (
        <p>Loading metrics…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Active Users</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics.activeUsers}</div>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Lesson Completions</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics.lessonCompletions}</div>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Engagement Score</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics.engagementScore}</div>
          </div>
        </div>
      )}
    </section>
  );
}
