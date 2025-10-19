import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AnalysisSummary renders post-game analysis metrics and suggestions.
 */
export function AnalysisSummary({ analysis, loading = false, error = null }) {
  if (loading) return <div role="status">Loading analysis…</div>;
  if (error) return <div role="alert" style={{ color: 'crimson' }}>{error}</div>;
  if (!analysis) return <p>No analysis available.</p>;

  const Item = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );

  return (
    <section aria-labelledby="analysis-title" style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
      <h2 id="analysis-title" style={{ marginTop: 0 }}>Analysis Summary</h2>
      <div role="group" aria-label="Key metrics">
        <Item label="Accuracy (White)" value={`${analysis.accuracyWhite ?? '—'}%`} />
        <Item label="Accuracy (Black)" value={`${analysis.accuracyBlack ?? '—'}%`} />
        <Item label="Blunders" value={analysis.blunders ?? '—'} />
        <Item label="Mistakes" value={analysis.mistakes ?? '—'} />
        <Item label="Best Moves" value={analysis.bestMoves ?? '—'} />
      </div>
      {analysis.summary && <p style={{ marginTop: 8 }}>{analysis.summary}</p>}
      {Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
        <>
          <h3 style={{ marginBottom: 6 }}>Suggestions</h3>
          <ul>
            {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </>
      )}
    </section>
  );
}
