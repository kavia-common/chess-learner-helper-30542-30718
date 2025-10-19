import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import useWebSocket from '../../hooks/useWebSocket';

/**
 * Realtime Play scaffold with matchmaking UI placeholder.
 * - Connects to WebSocket when REACT_APP_WS_URL is set.
 * - Provides simple lobby controls and logs events.
 * - Gracefully degrades with a clear notice when WS is unavailable.
 */

// PUBLIC_INTERFACE
export default function PlayRealtime() {
  /** Realtime practice placeholder with matchmaking stub and connection status. */
  const {
    supported,
    connected,
    status,
    lastMessage,
    error,
    send,
    reconnect,
    close,
    url,
  } = useWebSocket({
    onOpen: () => console.log('[Realtime] WS open'),
    onMessage: (ev) => {
      try {
        const data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        console.log('[Realtime] message', data);
      } catch {
        console.log('[Realtime] message', ev.data);
      }
    },
    onClose: (ev) => console.log('[Realtime] WS closed', ev.code),
    onError: (ev) => console.warn('[Realtime] WS error', ev),
  });

  const [queueing, setQueueing] = React.useState(false);
  const [roomId, setRoomId] = React.useState('');
  const [matchInfo, setMatchInfo] = React.useState(null);
  const [log, setLog] = React.useState([]);

  React.useEffect(() => {
    if (lastMessage) {
      setLog((prev) => [
        ...prev,
        { t: Date.now(), msg: typeof lastMessage.data === 'string' ? lastMessage.data : '[binary]' },
      ]);
      // naive attempt to parse a matchmaking event for demo
      try {
        const data = JSON.parse(lastMessage.data);
        if (data?.type === 'match_found') {
          setMatchInfo({ opponent: data.opponent || 'Opponent', room: data.room || 'room-xyz' });
          setQueueing(false);
        }
      } catch {
        // ignore parsing
      }
    }
  }, [lastMessage]);

  function safeSend(obj) {
    const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
    const ok = send(payload);
    if (!ok) {
      setLog((prev) => [...prev, { t: Date.now(), msg: '[send failed - not connected]' }]);
    } else {
      setLog((prev) => [...prev, { t: Date.now(), msg: `> ${payload}` }]);
    }
  }

  function handleJoinQueue() {
    setQueueing(true);
    safeSend({ type: 'join_queue', mode: 'casual' });
  }

  function handleLeaveQueue() {
    setQueueing(false);
    safeSend({ type: 'leave_queue' });
  }

  function handleCreateRoom() {
    safeSend({ type: 'create_room' });
  }

  function handleJoinRoom() {
    if (!roomId.trim()) return;
    safeSend({ type: 'join_room', room: roomId.trim() });
  }

  function handleReconnect() {
    reconnect();
  }

  function handleDisconnect() {
    close();
  }

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
        <Link to={ROUTES.PRACTICE}>&larr; Practice</Link>
      </nav>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Play in Realtime</h1>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Status: <strong>{status}</strong> {url ? `@ ${url}` : ''}
        </div>
      </header>

      {!supported && (
        <div role="alert" style={{ marginTop: 12, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
          Realtime backend is not configured. Set REACT_APP_WS_URL in your environment to enable live play. The UI remains usable for demonstration.
        </div>
      )}

      {supported && !connected && (
        <div role="status" style={{ marginTop: 12, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8 }}>
          Connecting to realtime service… If this takes long, ensure the backend is running and REACT_APP_WS_URL is correct.
        </div>
      )}

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Quick Match</h2>
          <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
            Join the casual matchmaking queue. This is a placeholder flow; no real backend contract assumed.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleJoinQueue} disabled={!connected || queueing} aria-disabled={!connected || queueing}>
              {queueing ? 'Searching…' : 'Find Opponent'}
            </button>
            <button className="btn" onClick={handleLeaveQueue} disabled={!connected || !queueing} aria-disabled={!connected || !queueing} style={{ background: '#6c757d' }}>
              Leave Queue
            </button>
          </div>
          {matchInfo && (
            <div style={{ marginTop: 12, padding: 8, border: '1px dashed var(--border-color)', borderRadius: 6 }}>
              <div><strong>Match found!</strong></div>
              <div>Opponent: {matchInfo.opponent}</div>
              <div>Room: {matchInfo.room}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn" disabled>Enter Room (stub)</button>
                <button className="btn" style={{ background: '#6c757d' }} onClick={() => setMatchInfo(null)}>Dismiss</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Play with a Friend</h2>
          <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
            Create a private room or join an existing room using a code. This is a stub UI with no strict server contract.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn" onClick={handleCreateRoom} disabled={!connected} aria-disabled={!connected}>Create Room</button>
            <input
              type="text"
              placeholder="Enter room code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ flex: '1 1 160px', padding: 8 }}
              aria-label="Room code"
            />
            <button className="btn" onClick={handleJoinRoom} disabled={!connected || !roomId.trim()} aria-disabled={!connected || !roomId.trim()}>
              Join
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Connection</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={handleReconnect}>Reconnect</button>
            <button className="btn" onClick={handleDisconnect} style={{ background: '#6c757d' }}>Disconnect</button>
          </div>
          {error && (
            <div role="alert" style={{ marginTop: 8, color: '#c62828' }}>
              A connection error occurred. Check console logs for details.
            </div>
          )}
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, minHeight: 120 }}>
          <h2 style={{ marginTop: 0 }}>Event Log</h2>
          <div style={{ fontFamily: 'monospace', fontSize: 12, maxHeight: 220, overflow: 'auto', background: 'var(--bg-secondary)', padding: 8, borderRadius: 6 }}>
            {log.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>No events yet.</div>
            ) : (
              log.slice(-50).map((l) => (
                <div key={l.t}>{new Date(l.t).toLocaleTimeString()} {l.msg}</div>
              ))
            )}
          </div>
        </div>
      </section>

      <div role="note" style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
        Note: This is an early scaffold. Events are logged and handlers are no-ops by design.
      </div>

      <style>{`
        @media (max-width: 900px) {
          section { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
