import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';


export class SocketController {
  private static onlineUsers: Map<string, any> = new Map();

  // when a user connects
  static handleConnection(io: Server, socket: Socket, user: any) {
    // track online user
    this.onlineUsers.set(user.id, { ...user, lastSeen: null });

    // notify others
    io.emit("user_status", {
      user: { id: user.id, name: user.name },
      status: "online",
      lastSeen: null,
    });
  }

  // when user disconnects
  static handleDisconnect(io: Server, socket: Socket, user: any) {
    const lastSeen = new Date().toISOString();

    // update map
    this.onlineUsers.delete(user.id);

    // notify others
    io.emit("user_status", {
      user: { id: user.id, name: user.name },
      status: "offline",
      lastSeen,
    });
  }

  // join room
static joinRoom(socket: Socket, data: any, cb?: Function) {
  socket.join(data.roomId);
  if (cb) cb({ success: true });
}

  // typing
  static typing(socket: Socket, data: any) {
    socket.to(data.roomId).emit("typing", {
      user: { id: data.userId, name: data.name },
    });
  }

  // send message
static sendMessage(io: Server, socket: Socket, data: any, cb?: Function) {
  io.to(data.roomId).emit("receive_message", {
    user: { id: data.userId, name: data.name },
    message: data.message,
    timestamp: new Date().toISOString(),
  });
  if (cb) cb({ success: true });
}
}

