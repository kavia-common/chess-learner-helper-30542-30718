import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// PUBLIC_INTERFACE
export default function Analytics() {
  /** Admin analytics page with simple placeholder charts. */
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAnalytics();
        if (mounted) setData(res);
      } catch {
        showToast('Failed to load analytics.', 'error', 4000);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showToast]);

  return (
    <div className="page" aria-labelledby="admin-analytics-title">
      <h1 id="admin-analytics-title">Analytics</h1>
      {loading && <p role="status">Loading analytics...</p>}
      {!loading && !data && <p>No analytics available.</p>}
      {!loading && data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <div className="card">
              <div className="card-title">Active Users</div>
              <div className="card-value">{data.activeUsers}</div>
            </div>
            <div className="card">
              <div className="card-title">New Users (7d)</div>
              <div className="card-value">{data.newUsers7d}</div>
            </div>
            <div className="card">
              <div className="card-title">Completions (7d)</div>
              <div className="card-value">{data.lessonCompletions7d}</div>
            </div>
            <div className="card">
              <div className="card-title">Avg Session (min)</div>
              <div className="card-value">{data.avgSessionMinutes}</div>
            </div>
          </div>

          <section aria-labelledby="bar-chart" style={{ marginTop: 24 }}>
            <h2 id="bar-chart">Daily Active Users</h2>
            <div role="img" aria-label="Bar chart of daily active users" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
              {data.trendDailyActive.map((d) => (
                <div key={d.day} style={{ width: 40, background: '#7ed321', height: `${d.value / 2.5}px` }} title={`${d.day}: ${d.value}`}></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {data.trendDailyActive.map((d) => (
                <span key={d.day} style={{ width: 40, textAlign: 'center', fontSize: 12 }}>{d.day}</span>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
