import React from 'react';
import { WS_URL as DEFAULT_WS_URL } from '../config/env';

/**
 * Lightweight WebSocket hook with graceful degradation.
 * - Reads REACT_APP_WS_URL via config/env.js (DEFAULT_WS_URL).
 * - If no URL configured, returns { supported: false } and logs a notice.
 * - Reconnects with backoff on unexpected closures.
 * - Exposes send, status, lastMessage, error, and a manual reconnect.
 */

// PUBLIC_INTERFACE
export default function useWebSocket(options = {}) {
  /** 
   * Hook to establish a WebSocket connection and manage state.
   * Params in options:
   * - url?: string (override env)
   * - protocols?: string | string[]
   * - onOpen?: (ev) => void
   * - onMessage?: (ev) => void
   * - onClose?: (ev) => void
   * - onError?: (ev) => void
   * - autoReconnect?: boolean (default true)
   * - maxRetries?: number (default 5)
   * - backoffMs?: number (base backoff in ms, default 800)
   * Returns:
   * {
   *   supported: boolean,
   *   connected: boolean,
   *   status: 'idle'|'connecting'|'open'|'closing'|'closed'|'unsupported',
   *   lastMessage: MessageEvent|null,
   *   error: Event|Error|null,
   *   send: (data: string | ArrayBuffer | Blob | ArrayBufferView) => boolean,
   *   reconnect: () => void,
   *   close: () => void,
   *   url: string | null
   * }
   */
  const {
    url: urlOverride,
    protocols,
    onOpen,
    onMessage,
    onClose,
    onError,
    autoReconnect = true,
    maxRetries = 5,
    backoffMs = 800,
  } = options;

  const wsUrl = String(urlOverride || DEFAULT_WS_URL || '').trim();

  const [status, setStatus] = React.useState(() =>
    wsUrl ? 'idle' : 'unsupported'
  );
  const [lastMessage, setLastMessage] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [connected, setConnected] = React.useState(false);

  const wsRef = React.useRef(null);
  const retriesRef = React.useRef(0);
  const timerRef = React.useRef(null);

  const supported = Boolean(wsUrl);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanup = () => {
    clearTimer();
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
  };

  const connect = React.useCallback(() => {
    if (!supported) {
      if (status !== 'unsupported') setStatus('unsupported');
      console.info('[useWebSocket] No WS URL configured; realtime is disabled.');
      return;
    }
    cleanup();
    try {
      setStatus('connecting');
      setConnected(false);
      const ws = new WebSocket(wsUrl, protocols);
      wsRef.current = ws;

      ws.onopen = (ev) => {
        setStatus('open');
        setConnected(true);
        retriesRef.current = 0;
        onOpen?.(ev);
      };

      ws.onmessage = (ev) => {
        setLastMessage(ev);
        onMessage?.(ev);
      };

      ws.onerror = (ev) => {
        setError(ev);
        onError?.(ev);
      };

      ws.onclose = (ev) => {
        setConnected(false);
        setStatus('closed');
        onClose?.(ev);
        if (autoReconnect && ev.code !== 1000 && retriesRef.current < maxRetries) {
          const delay = backoffMs * Math.pow(2, retriesRef.current);
          retriesRef.current += 1;
          clearTimer();
          timerRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      setError(err);
      setStatus('closed');
      if (autoReconnect && retriesRef.current < maxRetries) {
        const delay = backoffMs * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        clearTimer();
        timerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [supported, wsUrl, protocols, autoReconnect, maxRetries, backoffMs, onOpen, onMessage, onClose, onError]);

  React.useEffect(() => {
    connect();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, protocols]);

  const send = React.useCallback((data) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
        return true;
      } catch (err) {
        setError(err);
        return false;
      }
    }
    return false;
  }, []);

  const close = React.useCallback(() => {
    const ws = wsRef.current;
    if (ws) {
      setStatus('closing');
      try {
        ws.close(1000, 'client-close');
      } catch {
        // ignore
      }
    }
  }, []);

  const reconnect = React.useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  return {
    supported,
    connected,
    status,
    lastMessage,
    error,
    send,
    reconnect,
    close,
    url: supported ? wsUrl : null,
  };
}
