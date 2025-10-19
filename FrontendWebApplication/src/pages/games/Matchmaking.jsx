import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../../store/games';

/**
 * PUBLIC_INTERFACE
 * Matchmaking page lets users request a match and polls until a game is found.
 * Works in demo mode without backend by simulating a match found.
 */
export function Matchmaking() {
  const { state, actions } = useGames();
  const [pref, setPref] = useState({ rated: false, timeControl: '10|0' });
  const pollTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.matchmaking.foundGameId) {
      clearInterval(pollTimer.current);
      navigate(`/games/realtime/${state.matchmaking.foundGameId}`);
    }
  }, [state.matchmaking.foundGameId, navigate]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const start = async () => {
    await actions.startMatchmaking(pref);
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(() => {
      actions.pollMatchmaking();
    }, 1500);
  };

  const cancel = async () => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    await actions.cancelMatchmaking();
  };

  return (
    <section aria-labelledby="mm-title">
      <h1 id="mm-title">Find an Opponent</h1>
      <div style={{ maxWidth: 420 }}>
        <div style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
          <div style={{ marginBottom: 8 }}>
            <label>
              <input
                type="checkbox"
                checked={pref.rated}
                onChange={(e)=>setPref(p => ({ ...p, rated: e.target.checked }))}
              /> Rated game
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="tc">Time control</label>
            <select
              id="tc"
              value={pref.timeControl}
              onChange={(e)=>setPref(p => ({ ...p, timeControl: e.target.value }))}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
            >
              <option value="3|2">3+2 Blitz</option>
              <option value="5|0">5+0 Blitz</option>
              <option value="10|0">10+0 Rapid</option>
              <option value="15|10">15+10 Rapid</option>
            </select>
          </div>

          {!state.matchmaking.ticket ? (
            <button type="button" className="theme-toggle" style={{ position: 'static', width: '100%' }} onClick={start}>
              Start matchmaking
            </button>
          ) : (
            <button type="button" className="theme-toggle" style={{ position: 'static', width: '100%' }} onClick={cancel}>
              Cancel
            </button>
          )}
        </div>

        {state.matchmaking.ticket && (
          <div role="status" style={{ marginTop: 12 }}>
            Ticket: <code>{state.matchmaking.ticket.ticketId}</code> • Estimated wait: {state.matchmaking.eta || '—'}s
          </div>
        )}
        {state.matchmaking.error && (
          <div role="alert" style={{ marginTop: 8, color: 'crimson' }}>{state.matchmaking.error}</div>
        )}
      </div>
    </section>
  );
}
