import { Router } from 'express';
import { CliquesRouter } from './routers/cliques.router';
import { PostsRouter } from './routers/posts.router';
import { ResourcesRouter } from './routers/resources.router';
import { UsersRouter } from './routers/users.router';

export const HotspotRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

HotspotRouter.use('/users', UsersRouter);
HotspotRouter.use('/resources', ResourcesRouter);
HotspotRouter.use('/cliques', CliquesRouter);
HotspotRouter.use('/posts', PostsRouter);
