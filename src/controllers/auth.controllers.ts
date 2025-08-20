import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../utils/validators';

export class AuthController {
  static async register(req: Request, res: Response) {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error.flatten());

    try {
      const { email, password, name } = parse.data;
      const result = await AuthService.register(email, password, name);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json(parse.error.flatten());

    try {
      const { email, password } = parse.data;
      const result = await AuthService.login(email, password);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }
  }
}