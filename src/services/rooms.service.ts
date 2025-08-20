import { prisma } from '../db/prisma';

export class RoomsService {
  static async createRoom(userId: string, name: string, isPrivate: boolean) {
    return prisma.room.create({
      data: {
        name,
        isPrivate,
        ownerId: userId,
        members: { create: [{ userId }] }
      }
    });
  }

  static async joinRoom(userId: string, roomId?: string, inviteCode?: string) {
    let room = null;

    if (inviteCode) {
      room = await prisma.room.findFirst({ where: { inviteCode } });
      if (!room) throw new Error('Invalid invite');
    } else if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) throw new Error('Room not found');
      if (room.isPrivate) throw new Error('Private room requires invite');
    }

    await prisma.roomMember.upsert({
      where: { roomId_userId: { roomId: room!.id, userId } },
      update: {},
      create: { roomId: room!.id, userId }
    });

    return room;
  }

  static async listUserRooms(userId: string) {
    const rooms = await prisma.roomMember.findMany({
      where: { userId },
      include: { room: true }
    });
    return rooms.map(r => r.room);
  }

  static async getMessages(userId: string, roomId: string, take: number, cursor?: string) {
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } }
    });
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) throw new Error('Room not found');
    if (room.isPrivate && !member) throw new Error('No access');

    return prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });
  }
}