import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { FavorsRouter } from './routers/favors.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const MyfavorsRouter: Router = Router({ mergeParams: true });
MyfavorsRouter.use(bodyParser.json());
MyfavorsRouter.options(`*`, corsMiddleware);

/** Mount Routers */

MyfavorsRouter.use('/users', corsMiddleware, UsersRouter);
MyfavorsRouter.use('/favors', corsMiddleware, FavorsRouter);