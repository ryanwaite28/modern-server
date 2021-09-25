import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { NewsPostsRouter } from './routers/newsposts.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const WorldNewsRouter: Router = Router({ mergeParams: true });
WorldNewsRouter.use(bodyParser.json());
WorldNewsRouter.options(`*`, corsMiddleware);

/** Mount Routers */

WorldNewsRouter.use('/users', corsMiddleware, UsersRouter);
WorldNewsRouter.use('/newsposts', corsMiddleware, NewsPostsRouter);
