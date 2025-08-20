import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

export class SocketController {
  static async handleConnection(io: Server, socket: Socket, user: { id: string; name: string }) {
    await SocketService.userConnected(user.id, socket.id);
    io.emit('user_status', { userId: user.id, status: 'online' });
  }

  static async handleDisconnect(io: Server, socket: Socket, user: { id: string }) {
    const offline = await SocketService.userDisconnected(user.id, socket.id);
    if (offline) {
      io.emit('user_status', { userId: user.id, status: 'offline' });
    }
  }

  static async joinRoom(socket: Socket, data: { roomId: string }, cb?: Function) {
    try {
      const room = await SocketService.joinRoom((socket as any).user.id, data.roomId);
      socket.join(room.id);
      cb?.({ ok: true });
    } catch (err: any) {
      cb?.({ error: err.message });
    }
  }

  static async typing(socket: Socket, data: { roomId: string; isTyping: boolean }) {
    socket.to(data.roomId).emit('typing', {
      roomId: data.roomId,
      userId: (socket as any).user.id,
      isTyping: !!data.isTyping
    });
  }

  static async sendMessage(io: Server, socket: Socket, data: { roomId: string; content: string }, cb?: Function) {
    try {
      const user = (socket as any).user;
      const message = await SocketService.sendMessage(user.id, data.roomId, data.content);

      io.to(data.roomId).emit('receive_message', {
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        content: message.content,
        createdAt: message.createdAt
      });

      cb?.({ ok: true, messageId: message.id });
    } catch (err: any) {
      cb?.({ error: err.message });
    }
  }
}
