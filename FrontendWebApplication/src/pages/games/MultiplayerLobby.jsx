import React, { useEffect, useState } from 'react';
import ChessboardPlaceholder from '../../components/Chess/ChessboardPlaceholder';
import { openMultiplayerSocket } from '../../services/gamesService';

const FEATURE_MULTIPLAYER = String(process.env.REACT_APP_FEATURE_MULTIPLAYER || 'false') === 'true';

// PUBLIC_INTERFACE
export default function MultiplayerLobby() {
  /** Page for multiplayer lobby and connection placeholder. */
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    if (!FEATURE_MULTIPLAYER) return;
    let ws;
    try {
      ws = openMultiplayerSocket();
      ws.onopen = () => setStatus('Connected');
      ws.onclose = () => setStatus('Disconnected');
      ws.onerror = () => setStatus('Error');
    } catch {
      setStatus('Error');
    }
    return () => ws && ws.close();
  }, []);

  if (!FEATURE_MULTIPLAYER) return <p>Multiplayer feature is disabled.</p>;

  return (
    <section>
      <h1>Multiplayer Lobby</h1>
      <p>Status: {status}</p>
      <ChessboardPlaceholder />
    </section>
  );
}
