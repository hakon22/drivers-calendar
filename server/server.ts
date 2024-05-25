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
import redis from './db/redis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { NEXT_PUBLIC_PORT: port = 3001, NODE_ENV } = process.env;

const dev = NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  tokenChecker(passport);
  refreshTokenChecker(passport);
  temporaryTokenChecker(passport);

  server.use(express.json());
  server.use(cors());
  server.use(passport.initialize());
  server.use(router);

  const socketServer = createServer(server);
  const io = new Server(socketServer);

  io.on('connection', (socket) => {
    socket.on('userConnection', async (userId) => {
      redis.set(socket.id, userId);
      socket.join(userId);
    });
    socket.on('makeSchedule', (data) => io.emit('makeSchedule', data));
    socket.on('sendNotification', async (data) => {
      if (data.sendAll) {
        io.emit('sendNotification', data);
      } else {
        const socketId = await redis.get(data.userId);
        if (socketId) {
          socket.to(JSON.parse(socketId)).emit('sendNotification', data);
        }
      }
    });
    socket.on('disconnect', async () => {
      socket.disconnect();
      await redis.del(socket.id);
    });
  });

  server.all('*', (req, res) => handle(req, res));

  socketServer.listen(port, () => console.log(`Server is online on port: ${port}`));
});

export const uploadFilesPath = NODE_ENV === 'development'
  ? join(__dirname, '..', 'src', 'images')
  : join(__dirname, '..', '.next', 'static', 'media');

connectToDb();
