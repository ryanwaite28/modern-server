
import cors from 'cors';
import { Router } from 'express';

import { corsOptions } from '../chamber';
import { UserRouter } from './users.router';
import { InfoRouter } from './info.router';
import { ResourcesRouter } from './resources.router';
import { CliquesRouter } from './cliques.router';
import { PostsRouter } from './posts.router';

export const MainRouter: Router = Router();

/** Mount Routers */

const corsMiddleware = cors(corsOptions);

MainRouter.options(`*`, corsMiddleware);

MainRouter.use('/info', corsMiddleware, InfoRouter);
MainRouter.use('/users', corsMiddleware, UserRouter);
MainRouter.use('/resources', corsMiddleware, ResourcesRouter);
MainRouter.use('/cliques', corsMiddleware, CliquesRouter);
MainRouter.use('/posts', corsMiddleware, PostsRouter);
