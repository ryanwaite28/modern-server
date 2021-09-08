import { Router } from 'express';
import { InfoRouter } from './routers/info.router';
import { UsersRouter } from './routers/users.router';
import { UtilsRouter } from './routers/utils.router';

// Router
export const CommonRouter: Router = Router({ mergeParams: true });

CommonRouter.use('/info', InfoRouter);
CommonRouter.use('/utils', UtilsRouter);
CommonRouter.use('/users', UsersRouter);
