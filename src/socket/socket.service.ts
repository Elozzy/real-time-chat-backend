import { prisma } from '../db/prisma';
import { checkMessageRate } from '../utils/rateLimiter';

// Presence map: userId -> Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

export class SocketService {
  /** Track user connecting */
  static async userConnected(userId: string, socketId: string) {
    const sockets = onlineUsers.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    onlineUsers.set(userId, sockets);
  }

  /** Track user disconnecting */
  static async userDisconnected(userId: string, socketId: string) {
    const set = onlineUsers.get(userId);
    if (!set) return false;

    set.delete(socketId);
    if (set.size === 0) {
      onlineUsers.delete(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() }
      });
      return true; // user fully offline
    }
    return false;
  }

  /** Join a room (validates membership) */
  static async joinRoom(userId: string, roomId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } }
    });

    if (room.isPrivate && !member) throw new Error('No access to private room');

    // auto-enroll if public
    if (!room.isPrivate && !member) {
      await prisma.roomMember.create({ data: { roomId, userId } });
    }

    return room;
  }

  /** Handle sending a message */
  static async sendMessage(userId: string, roomId: string, content: string) {
    if (!content || !content.trim()) throw new Error('Message cannot be empty');
    if (content.length > 2000) throw new Error('Message too long');
    if (!checkMessageRate(userId)) throw new Error('Rate limit exceeded');

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');

    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } }
    });
    if (room.isPrivate && !member) throw new Error('No access');

    const message = await prisma.message.create({
      data: { roomId, userId, content: content.trim() }
    });

    return message;
  }

  /** Check online presence */
  static isUserOnline(userId: string) {
    return onlineUsers.has(userId);
  }
}
