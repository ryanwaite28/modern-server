import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { FetchesRouter } from './routers/fetches.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const FetchAppRouter: Router = Router({ mergeParams: true });
FetchAppRouter.use(bodyParser.json());
FetchAppRouter.options(`*`, corsMiddleware);

/** Mount Routers */

FetchAppRouter.use('/users', corsMiddleware, UsersRouter);
FetchAppRouter.use('/fetches', corsMiddleware, FetchesRouter);