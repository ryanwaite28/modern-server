import { Router } from 'express';
import { corsMiddleware } from './common.chamber';
import { InfoRouter } from './routers/info.router';
import { UsersRouter } from './routers/users.router';
import { UtilsRouter } from './routers/utils.router';
import * as bodyParser from 'body-parser';

// Router
export const CommonRouter: Router = Router({ mergeParams: true });
CommonRouter.use(bodyParser.json());

CommonRouter.options(`*`, corsMiddleware);

CommonRouter.use('/info', corsMiddleware, InfoRouter);
CommonRouter.use('/utils', corsMiddleware, UtilsRouter);
CommonRouter.use('/users', corsMiddleware, UsersRouter);

// CommonRouter.use('/payments', PaymentsRouter);
