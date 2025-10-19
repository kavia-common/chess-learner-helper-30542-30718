//
// Realtime game service stubs for future backend integration.
// Provides helper creators for common messages used by PlayRealtime.
// All functions are pure factories for JSON payloads.
//
// PUBLIC_INTERFACE
export function msgJoinQueue(mode = 'casual') {
  /** Create a join queue message. */
  return JSON.stringify({ type: 'join_queue', mode });
}

// PUBLIC_INTERFACE
export function msgLeaveQueue() {
  /** Create a leave queue message. */
  return JSON.stringify({ type: 'leave_queue' });
}

// PUBLIC_INTERFACE
export function msgCreateRoom() {
  /** Create a create room message. */
  return JSON.stringify({ type: 'create_room' });
}

// PUBLIC_INTERFACE
export function msgJoinRoom(room) {
  /** Create a join room message. */
  return JSON.stringify({ type: 'join_room', room });
}

// PUBLIC_INTERFACE
export function msgMove(room, move) {
  /** Create a move message; `move` is engine-specific payload. */
  return JSON.stringify({ type: 'move', room, move });
}
