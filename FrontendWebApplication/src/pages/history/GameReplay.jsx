import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chessboard } from '../../components/games/Chessboard';
import { MoveList } from '../../components/history/MoveList';
import { AnalysisSummary } from '../../components/history/AnalysisSummary';
import { useHistoryStore } from '../../store/history';

/**
 * PUBLIC_INTERFACE
 * GameReplay renders a past game's details with a replay board, move list, and hint/analysis panels.
 */
export function GameReplay() {
  const { gameId } = useParams();
  const { state, actions } = useHistoryStore();
  const [plyIndex, setPlyIndex] = useState(0);

  useEffect(() => {
    actions.fetchGame(gameId);
    actions.fetchAnalysis(gameId);
    setPlyIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const moves = useMemo(() => {
    const list = state.detail.game?.moves || [];
    return Array.isArray(list) ? list : [];
  }, [state.detail.game]);

  const boardHistory = useMemo(() => {
    // Chessboard takes an array of uci-like strings to render position.
    return moves.slice(0, Math.max(0, plyIndex));
  }, [moves, plyIndex]);

  const onSelectMove = (idx) => setPlyIndex(idx + 1);

  const onPrev = () => setPlyIndex(p => Math.max(0, p - 1));
  const onNext = () => setPlyIndex(p => Math.min(moves.length, p + 1));
  const onStart = () => setPlyIndex(0);
  const onEnd = () => setPlyIndex(moves.length);

  const requestHint = async () => {
    await actions.fetchHint({ gameId, plyIndex });
  };

  return (
    <section aria-labelledby="replay-title">
      <h1 id="replay-title">Game Replay</h1>
      {state.detail.loading && <div role="status">Loading game…</div>}
      {state.detail.error && <div role="alert" style={{ color: 'crimson' }}>{state.detail.error}</div>}
      {!state.detail.loading && !state.detail.error && state.detail.game && (
        <>
          <div style={{ marginBottom: 8 }}>
            <div><strong>Game:</strong> <code>{state.detail.game.id}</code></div>
            <div><strong>Opponent:</strong> {state.detail.game.opponent || '—'}</div>
            <div><strong>Date:</strong> {formatDate(state.detail.game.date)}</div>
            <div><strong>Result:</strong> <code>{state.detail.game.result}</code> {state.detail.game.rated ? '(Rated)' : '(Casual)'}</div>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <Chessboard history={boardHistory} orientation="white" onMove={() => { /* no direct editing in replay */ }} />
              <div role="group" aria-label="Replay controls" style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={onStart} disabled={plyIndex === 0}>|&lt;</button>
                <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={onPrev} disabled={plyIndex === 0}>&lt;</button>
                <div style={{ alignSelf: 'center' }} aria-live="polite">Move {plyIndex} / {moves.length}</div>
                <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={onNext} disabled={plyIndex >= moves.length}>&gt;</button>
                <button type="button" className="theme-toggle" style={{ position: 'static' }} onClick={onEnd} disabled={plyIndex >= moves.length}>&gt;|</button>
              </div>
            </div>

            <div style={{ minWidth: 280, maxWidth: 380, flex: 1 }}>
              <h2 style={{ marginTop: 0 }}>Moves</h2>
              <MoveList moves={moves} currentPly={Math.max(0, plyIndex - 1)} onSelect={onSelectMove} />

              <section aria-labelledby="hints-title" style={{ marginTop: 12 }}>
                <h2 id="hints-title" style={{ marginBottom: 6 }}>Hints</h2>
                <p style={{ marginTop: 0, fontSize: 12, color: 'var(--text-primary)' }}>
                  Hint availability may be limited for rated games. In demo/no-backend mode, simple generic hints are shown.
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" onClick={requestHint} className="theme-toggle" style={{ position: 'static' }}>
                    Get hint for current position
                  </button>
                  {state.hint.loading && <span role="status">Fetching hint…</span>}
                </div>
                {state.hint.error && <div role="alert" style={{ color: 'crimson', marginTop: 6 }}>{state.hint.error}</div>}
                {state.hint.data && (
                  <div style={{ marginTop: 8, border: '1px solid var(--border-color)', borderRadius: 8, padding: 8, background: 'var(--bg-secondary)' }}>
                    <div><strong>Suggested move:</strong> <code>{state.hint.data.move}</code></div>
                    {state.hint.data.explanation && <div style={{ marginTop: 4 }}>{state.hint.data.explanation}</div>}
                    {state.hint.data.limited && <div style={{ marginTop: 4, fontSize: 12 }}>(Hint usage limited in rated games)</div>}
                  </div>
                )}
              </section>
            </div>

            <div style={{ minWidth: 320, flex: 1 }}>
              <AnalysisSummary analysis={state.analysis.data} loading={state.analysis.loading} error={state.analysis.error} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/history">Back to history</Link>
          </div>
        </>
      )}
    </section>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso || '');
  }
}
