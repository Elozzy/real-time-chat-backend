import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { config } from '../config/env';

export class AuthService {
  static async register(email: string, password: string, name: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error('Email already in use');

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hash, name } });

    return this.generateAuthResponse(user);
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    return this.generateAuthResponse(user);
  }

  private static generateAuthResponse(user: { id: string; email: string; name: string }) {
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }
}