import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { authRouter } from './routes/auth.routes';
import { roomsRouter } from './routes/rooms.routes';
import { createIO } from './socket/io';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);

// HTTP + Socket
const server = http.createServer(app);
createIO(server);

server.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
