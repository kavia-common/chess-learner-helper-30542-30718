import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Chessboard } from '../../components/games/Chessboard';
import { useGames } from '../../store/games';

/**
 * PUBLIC_INTERFACE
 * RealtimeGame shows a live game structure and is ready for WebSocket integration.
 * Currently loads game state via REST stub and shows moves list. Move posting is stubbed.
 */
export function RealtimeGame() {
  const { gameId } = useParams();
  const { state, actions } = useGames();

  useEffect(() => {
    actions.loadRealtimeGame(gameId);
    // Future: setup WebSocket here and dispatch actions on incoming messages.
    // Cleanup would close the WS connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const onMove = ({ from, to }) => {
    // For now, just append to moves list as a placeholder
    actions.applyRealtimeMove({ from, to });
    // Future: send move over WS or via postMove API
  };

  if (state.realtime.loading) return <div role="status">Loading game…</div>;
  if (state.realtime.error) return <div role="alert" style={{ color: 'crimson' }}>{state.realtime.error}</div>;
  if (!state.realtime.game) return null;

  const history = (state.realtime.game.moves || []).map((m) => {
    if (m && typeof m === 'string' && m.length >= 4) return m;
    if (m?.from && m?.to) return String(m.from) + String(m.to);
    return '';
  });

  return (
    <section aria-labelledby="rt-title">
      <h1 id="rt-title">Realtime Game</h1>
      <p>Game ID: <code>{state.realtime.game.id}</code> • Status: {state.realtime.game.status}</p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <Chessboard history={history} orientation="white" onMove={onMove} />
        </div>
        <div style={{ minWidth: 280, maxWidth: 360 }}>
          <div style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
            <h2 style={{ marginTop: 0 }}>Players</h2>
            <div>White: {state.realtime.game.players?.white || '—'}</div>
            <div>Black: {state.realtime.game.players?.black || '—'}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h2 style={{ marginBottom: 6 }}>Moves</h2>
            <ol style={{ maxHeight: 200, overflow: 'auto', paddingLeft: 18, marginTop: 0 }}>
              {history.map((m, idx) => <li key={`${m}-${idx}`}><code>{m}</code></li>)}
            </ol>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-primary)' }}>
        Note: WebSocket integration to sync moves in real-time will be added when backend is ready.
      </p>
    </section>
  );
}
