import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { MarkersRouter } from './routers/markers.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const TravellrsRouter: Router = Router({ mergeParams: true });
TravellrsRouter.use(bodyParser.json());
TravellrsRouter.options(`*`, corsMiddleware);

/** Mount Routers */

TravellrsRouter.use('/users', corsMiddleware, UsersRouter);
TravellrsRouter.use('/markers', corsMiddleware, MarkersRouter);
