import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

type Client = {
  ws: WebSocket;
  userId: string;
};
type Room = {
  id: string;
  white?: Client;
  black?: Client;
  createdAt: number;
};

const waitingQueue: Client[] = [];
const rooms = new Map<string, Room>();

function authFromQuery(url?: string): { ok: boolean; userId?: string } {
  try {
    if (!url) return { ok: false };
    const u = new URL(url, 'http://localhost');
    const token = u.searchParams.get('token');
    if (!token) return { ok: false };
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
    return { ok: true, userId: payload.sub };
  } catch {
    return { ok: false };
  }
}

function createRoomId(): string {
  return `r_${Math.random().toString(36).slice(2, 10)}`;
}

function serializeRoom(room: Room) {
  return {
    id: room.id,
    white: room.white?.userId,
    black: room.black?.userId,
  };
}

/**
 * PUBLIC_INTERFACE
 * Attaches WebSocket /ws/multiplayer server with basic auth and matchmaking.
 */
export function attachMultiplayerWSS(server: any) {
  /** Binds a WebSocketServer to the given HTTP server under /ws/multiplayer. */
  const wss = new WebSocketServer({ server, path: '/ws/multiplayer' });

  wss.on('connection', (ws, req) => {
    const auth = authFromQuery(req.url);
    if (!auth.ok || !auth.userId) {
      ws.close(1008, 'Unauthorized');
      return;
    }
    const client: Client = { ws, userId: auth.userId };

    ws.send(JSON.stringify({ type: 'hello', userId: client.userId }));

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const type = msg?.type;

        if (type === 'join_random') {
          waitingQueue.push(client);
          // Try to match if two clients queued
          if (waitingQueue.length >= 2) {
            const p1 = waitingQueue.shift()!;
            const p2 = waitingQueue.shift()!;
            const room: Room = { id: createRoomId(), createdAt: Date.now() };
            // Randomize colors
            if (Math.random() < 0.5) {
              room.white = p1;
              room.black = p2;
            } else {
              room.white = p2;
              room.black = p1;
            }
            rooms.set(room.id, room);
            const payload = { type: 'matched', room: serializeRoom(room) };
            p1.ws.send(JSON.stringify(payload));
            p2.ws.send(JSON.stringify(payload));
          } else {
            ws.send(JSON.stringify({ type: 'queued' }));
          }
          return;
        }

        if (type === 'join_room') {
          const room = rooms.get(msg.roomId);
          if (!room) {
            ws.send(JSON.stringify({ type: 'error', error: 'room_not_found' }));
            return;
          }
          if (!room.white) room.white = client;
          else if (!room.black && room.white.userId !== client.userId) room.black = client;
          ws.send(JSON.stringify({ type: 'joined', room: serializeRoom(room) }));
          return;
        }

        if (type === 'move') {
          const room = rooms.get(msg.roomId);
          if (!room) return ws.send(JSON.stringify({ type: 'error', error: 'room_not_found' }));
          const movePayload = { type: 'move', move: msg.move, by: client.userId, roomId: room.id };
          room.white?.ws !== ws && room.white?.ws.send(JSON.stringify(movePayload));
          room.black?.ws !== ws && room.black?.ws.send(JSON.stringify(movePayload));
          return;
        }

        if (type === 'resign') {
          const room = rooms.get(msg.roomId);
          if (!room) return;
          const resignPayload = { type: 'resign', by: client.userId, roomId: room.id };
          room.white?.ws.send(JSON.stringify(resignPayload));
          room.black?.ws.send(JSON.stringify(resignPayload));
          rooms.delete(room.id);
          return;
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'bad_message' }));
      }
    });

    ws.on('close', () => {
      // Remove from queue if present
      const idx = waitingQueue.findIndex((c) => c === client);
      if (idx >= 0) waitingQueue.splice(idx, 1);
      // Clean up any rooms where this client participated and notify opponent
      for (const [id, room] of rooms) {
        if (room.white?.ws === ws || room.black?.ws === ws) {
          const opponent = room.white?.ws === ws ? room.black : room.white;
          opponent?.ws.send(JSON.stringify({ type: 'opponent_disconnected', roomId: id }));
          rooms.delete(id);
        }
      }
    });
  });

  return wss;
}
