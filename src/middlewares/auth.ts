import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; name: string };
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}