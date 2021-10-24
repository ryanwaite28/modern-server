import * as bodyParser from 'body-parser';
import { Router } from 'express';
import { corsMiddleware } from '../_common/common.chamber';

import { UsersRouter } from './routers/users.router';
import { PostsRouter } from './routers/posts.router';
import { NoticesRouter } from './routers/notices.router';
import { CliquesRouter } from './routers/cliques.router';
import { ResourcesRouter } from './routers/resources.router';

export const HotspotRouter: Router = Router({ mergeParams: true });
HotspotRouter.use(bodyParser.json());
HotspotRouter.options(`*`, corsMiddleware);

/** Mount Routers */

HotspotRouter.use('/users', corsMiddleware, UsersRouter);
HotspotRouter.use('/posts', corsMiddleware, PostsRouter);
HotspotRouter.use('/notices', corsMiddleware, NoticesRouter);
HotspotRouter.use('/cliques', corsMiddleware, CliquesRouter);
HotspotRouter.use('/resources', corsMiddleware, ResourcesRouter);
