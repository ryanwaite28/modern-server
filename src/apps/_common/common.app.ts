import { Router } from 'express';
import { InfoRouter } from './routers/info.router';
import { UsersRouter } from './routers/users.router';
import { UsersService } from './services/users.service';

// Router
export const CommonRouter: Router = Router({ mergeParams: true });

CommonRouter.use('/info', InfoRouter);
CommonRouter.use('/users', UsersRouter);
