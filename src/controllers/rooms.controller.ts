import { Request, Response } from 'express';
import { RoomsService } from '../services/rooms.service';
import { createRoomSchema, joinRoomSchema } from '../utils/validators';

export class RoomsController {
  static async create(req: Request, res: Response) {
    const parse = createRoomSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error.flatten());

    try {
      const room = await RoomsService.createRoom(req.user!.id, parse.data.name, parse.data.isPrivate);
      return res.status(201).json(room);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async join(req: Request, res: Response) {
    const parse = joinRoomSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error.flatten());

    try {
      const room = await RoomsService.joinRoom(req.user!.id, parse.data.roomId, parse.data.inviteCode);
      return res.json(room);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async mine(req: Request, res: Response) {
    try {
      const rooms = await RoomsService.listUserRooms(req.user!.id);
      return res.json(rooms);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const take = Number(req.query.take ?? 50);
      const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

      const messages = await RoomsService.getMessages(req.user!.id, roomId, take, cursor);
      return res.json({
        items: messages.reverse(),
        nextCursor: messages.length ? messages[0].id : null
      });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
}
