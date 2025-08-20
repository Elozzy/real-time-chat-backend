import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createRoomSchema = z.object({
  name: z.string().min(2),
  isPrivate: z.boolean().optional().default(false)
});

export const joinRoomSchema = z.object({
  roomId: z.string().optional(),
  inviteCode: z.string().optional()
}).refine(d => d.roomId || d.inviteCode, { message: 'roomId or inviteCode required' });

export const sendMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().trim().min(1).max(2000)
});