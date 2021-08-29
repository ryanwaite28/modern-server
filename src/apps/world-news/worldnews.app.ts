import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { NewsPostsRouter } from './routers/newsposts.router';

export const WorldNewsRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

WorldNewsRouter.use('/users', UsersRouter);
WorldNewsRouter.use('/newsposts', NewsPostsRouter);
