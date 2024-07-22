/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
import 'dotenv/config';
import express from 'express';
import next from 'next';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import cors from 'cors';
import passport from 'passport';
import { Server } from 'socket.io';
import tokenChecker from './authentication/tokenChecker.js';
import refreshTokenChecker from './authentication/refreshTokenChecker.js';
import temporaryTokenChecker from './authentication/temporaryTokenChecker.js';
import { connectToDb } from './db/connect.js';
import router from './api.js';
import createRelations from './db/relations.js';
import SocketEventEnum from './types/notification/enum/SocketEventEnum.js';
import SocketEvents from './socket/SocketEvents.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { NEXT_PUBLIC_PORT: port = 3001, NODE_ENV } = process.env;

const dev = NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
const socketServer = createServer(server);
const io = new Server(socketServer, { transports: ['websocket'] });

export const socketEventsService = new SocketEvents(io);

app.prepare().then(() => {
  tokenChecker(passport);
  refreshTokenChecker(passport);
  temporaryTokenChecker(passport);

  server.use(express.json());
  server.use(cors());
  server.use(passport.initialize());
  server.use(router);

  io.on('connection', (socket) => {
    socket.on(SocketEventEnum.USER_CONNECTION, (userId) => socket.join(`USER:${userId}`));
    socket.on(SocketEventEnum.CREW_CONNECTION, (crewId) => socket.join(`CREW:${crewId}`));
    socket.on(SocketEventEnum.DISCONNECT, () => socket.disconnect());
  });

  server.all('*', (req, res) => handle(req, res));

  socketServer.listen(port, () => console.log(`Server is online on port: ${port}`));
});

export const uploadFilesPath = NODE_ENV === 'development'
  ? join(__dirname, '..', 'src', 'images')
  : join(__dirname, '..', '.next', 'static', 'media');

await connectToDb();
await createRelations();
