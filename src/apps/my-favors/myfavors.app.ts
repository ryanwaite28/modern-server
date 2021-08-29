import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { FavorsRouter } from './routers/favors.router';

export const MyfavorsRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

MyfavorsRouter.use('/users', UsersRouter);
MyfavorsRouter.use('/favors', FavorsRouter);