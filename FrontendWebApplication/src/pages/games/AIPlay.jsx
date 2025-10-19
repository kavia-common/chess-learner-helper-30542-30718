import React, { useEffect, useState } from 'react';
import { logGameStarted, logGameCompleted } from '../../utils/analytics';
import Spinner from '../../components/common/Spinner';
import Skeleton from '../../components/common/Skeleton';
import { handleApiError } from '../../utils/errorHandler';
import { useToast } from '../../components/common/Toast';
import { Chessboard } from '../../components/games/Chessboard';
import { useGames } from '../../store/games';

/**
 * PUBLIC_INTERFACE
 * AIPlay allows the user to play against a simple AI.
 * - Select difficulty
 * - New game
 * - Make moves via the Chessboard (keyboard or mouse)
 */
export function AIPlay() {
  const { state, actions } = useGames();
  const [status, setStatus] = useState('');

  useEffect(() => {
    // ensure a new game if none
    if (!state.ai.history || state.ai.history.length === 0) {
      actions.newAiGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUserMove = ({ from, to }) => {
    const ok = actions.makeAiMove({ from, to });
    if (!ok) {
      setStatus('Illegal move. Try a different move.');
      setTimeout(() => setStatus(''), 1200);
    } else {
      setStatus('');
    }
  };

  return (
    <section aria-labelledby="ai-title">
      <h1 id="ai-title">Play vs AI</h1>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <Chessboard history={state.ai.history} orientation="white" onMove={onUserMove} />
        </div>
        <div style={{ minWidth: 280, maxWidth: 360 }}>
          <div style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
            <h2 style={{ marginTop: 0 }}>Settings</h2>
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={state.ai.difficulty}
              onChange={(e)=>actions.setAiDifficulty(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', marginBottom: 8 }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button type="button" className="theme-toggle" style={{ position: 'static', width: '100%' }} onClick={actions.newAiGame}>
              New Game
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <h2 style={{ marginBottom: 6 }}>Moves</h2>
            <ol style={{ maxHeight: 200, overflow: 'auto', paddingLeft: 18, marginTop: 0 }}>
              {state.ai.history.map((m, idx) => <li key={`${m}-${idx}`}><code>{m}</code></li>)}
            </ol>
          </div>

          {status && <div role="status" style={{ marginTop: 8 }}>{status}</div>}
        </div>
      </div>
    </section>
  );
}
