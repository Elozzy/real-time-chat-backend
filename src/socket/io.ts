import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { SocketController } from './socket.controller';

export function createIO(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: config.clientOrigin, credentials: true }
  });

  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (typeof token !== 'string') return next(new Error('Unauthorized'));

    try {
      const payload = jwt.verify(token, config.jwtSecret) as { id: string; email: string; name: string };
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;

    // User connected
    SocketController.handleConnection(io, socket, user);

    // Event bindings
    socket.on('join_room', (data, cb) => SocketController.joinRoom(socket, data, cb));
    socket.on('typing', (data) => SocketController.typing(socket, data));
    socket.on('send_message', (data, cb) => SocketController.sendMessage(io, socket, data, cb));

    socket.on('disconnect', () => SocketController.handleDisconnect(io, socket, user));
  });

  return io;
}
