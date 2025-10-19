import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { getAnalytics } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** Admin landing: shows summary metrics and quick links. */
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
    <div className="page" aria-labelledby="admin-dashboard-title">
      <h1 id="admin-dashboard-title">Admin Dashboard</h1>
      <p className="muted">Manage users, lessons, moderation, and view analytics.</p>

      {loading && <p role="status">Loading dashboard...</p>}
      {!loading && !data && <p role="status">No analytics available.</p>}

      {!loading && data && (
        <>
          <section aria-labelledby="metrics-heading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <h2 id="metrics-heading" className="sr-only">Key Metrics</h2>
            <div className="card" role="group" aria-label="Active users">
              <div className="card-title">Active Users</div>
              <div className="card-value" aria-live="polite">{data.activeUsers}</div>
            </div>
            <div className="card" role="group" aria-label="New users in last 7 days">
              <div className="card-title">New Users (7d)</div>
              <div className="card-value">{data.newUsers7d}</div>
            </div>
            <div className="card" role="group" aria-label="Lesson completions in last 7 days">
              <div className="card-title">Lesson Completions (7d)</div>
              <div className="card-value">{data.lessonCompletions7d}</div>
            </div>
            <div className="card" role="group" aria-label="Average session length in minutes">
              <div className="card-title">Avg Session (min)</div>
              <div className="card-value">{data.avgSessionMinutes}</div>
            </div>
          </section>

          <section aria-labelledby="trend-heading" style={{ marginTop: 24 }}>
            <h2 id="trend-heading">Daily Active Users</h2>
            <div role="img" aria-label="Daily active users bar chart" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {data.trendDailyActive.map((d) => (
                <div key={d.day} style={{ width: 36, background: '#4a90e2', height: `${d.value / 3}px` }} title={`${d.day}: ${d.value}`}></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {data.trendDailyActive.map((d) => (
                <span key={d.day} style={{ width: 36, textAlign: 'center', fontSize: 12 }}>{d.day}</span>
              ))}
            </div>
          </section>

          <nav aria-label="Admin quick links" style={{ marginTop: 24 }}>
            <ul className="inline-links">
              <li><Link to={`${ROUTES.ADMIN}/users`} className="btn small">Manage Users</Link></li>
              <li><Link to={`${ROUTES.ADMIN}/lessons`} className="btn small">Lessons CMS</Link></li>
              <li><Link to={`${ROUTES.ADMIN}/moderation`} className="btn small">Moderation</Link></li>
              <li><Link to={`${ROUTES.ADMIN}/analytics`} className="btn small">Analytics</Link></li>
              <li><Link to={`${ROUTES.ADMIN}/audit-log`} className="btn small">Audit Log</Link></li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
