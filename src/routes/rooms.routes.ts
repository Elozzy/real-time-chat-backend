import { Router } from 'express';
import { RoomsController } from '../controllers/rooms.controller';
import { authRequired } from '../middlewares/auth';

export const roomsRouter = Router();

roomsRouter.post('/', authRequired, RoomsController.create);
roomsRouter.post('/join', authRequired, RoomsController.join);
roomsRouter.get('/mine', authRequired, RoomsController.mine);
roomsRouter.get('/:roomId/messages', authRequired, RoomsController.getMessages);
