import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'tarnished',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? '*',
};