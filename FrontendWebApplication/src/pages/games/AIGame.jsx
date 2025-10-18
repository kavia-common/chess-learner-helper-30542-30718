import React, { useState } from 'react';
import ChessboardPlaceholder from '../../components/Chess/ChessboardPlaceholder';
import { startAIGame } from '../../services/gamesService';

const FEATURE_AI = String(process.env.REACT_APP_FEATURE_AI || 'true') === 'true';

// PUBLIC_INTERFACE
export default function AIGame() {
  /** Page for AI practice game with difficulty selection (placeholder). */
  // Hooks must be called unconditionally
  const [difficulty, setDifficulty] = useState('beginner');
  const [gameId, setGameId] = useState(null);

  if (!FEATURE_AI) {
    // Render gating occurs after hooks are declared
    return <p>AI feature is disabled.</p>;
  }

  const start = async () => {
    const res = await startAIGame({ difficulty });
    setGameId(res.gameId);
  };

  return (
    <section>
      <h1>Practice vs AI</h1>
      <label>
        Difficulty
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>
      <button className="btn" onClick={start}>Start Game</button>
      {gameId && <p>Game started: {gameId}</p>}

      <div style={{ marginTop: '1rem' }}>
        <ChessboardPlaceholder />
      </div>
    </section>
  );
}
