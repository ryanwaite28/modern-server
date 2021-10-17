import { Router } from 'express';
import { CliquesRouter } from './routers/cliques.router';
import { PostsRouter } from './routers/posts.router';
import { ResourcesRouter } from './routers/resources.router';
import { UsersRouter } from './routers/users.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const HotspotRouter: Router = Router({ mergeParams: true });
HotspotRouter.use(bodyParser.json());
HotspotRouter.options(`*`, corsMiddleware);

/** Mount Routers */

HotspotRouter.use('/users', corsMiddleware, UsersRouter);
HotspotRouter.use('/posts', corsMiddleware, PostsRouter);
HotspotRouter.use('/cliques', corsMiddleware, CliquesRouter);
HotspotRouter.use('/resources', corsMiddleware, ResourcesRouter);
