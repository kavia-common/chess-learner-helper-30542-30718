import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/progressService';
import ProgressBar from '../components/Progress/ProgressBar';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Authenticated dashboard showing simple progress. */
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;
  return (
    <section>
      <h1>Your Dashboard</h1>
      <p>Points: {data.points}</p>
      <div style={{ maxWidth: 300 }}>
        <p>Lessons Completed</p>
        <ProgressBar value={Math.min(100, data.lessonsCompleted * 10)} />
      </div>
    </section>
  );
}
