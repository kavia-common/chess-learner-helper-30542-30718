import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app, { openApiSetup } from './app.js';

const PORT = Number(process.env.PORT || 4000);

// initialize Swagger/OpenAPI setup before start
openApiSetup(app);

const server = http.createServer(app);

// Attach Multiplayer WebSocket server
import { attachMultiplayerWSS } from './websocket/multiplayer.js';
if (String(process.env.FEATURE_MULTIPLAYER || 'true') === 'true') {
  attachMultiplayerWSS(server);
}

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT} - Docs at http://localhost:${PORT}/docs`);
});

export default server;
