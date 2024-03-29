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
import { connectToDb } from './db/connect.js';
import router from './api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { NEXT_PUBLIC_PORT: port = 3001, NODE_ENV } = process.env;

const dev = NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  tokenChecker(passport);
  refreshTokenChecker(passport);

  server.use(express.json());
  server.use(cors());
  server.use(passport.initialize());
  server.use(router);

  const socketServer = createServer(server);
  const io = new Server(socketServer);

  io.on('connection', (socket) => {
    socket.on('test', (data) => io.emit('test', data));
  });

  server.all('*', (req, res) => handle(req, res));

  socketServer.listen(port, () => console.log(`Server is online on port: ${port}`));
});

export const uploadFilesPath = NODE_ENV === 'development'
  ? join(__dirname, '..', 'src', 'images')
  : join(__dirname, '..', '.next', 'static', 'media');

connectToDb();
