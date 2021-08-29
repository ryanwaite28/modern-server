import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { MarkersRouter } from './routers/markers.router';

export const TravellrsRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

TravellrsRouter.use('/users', UsersRouter);
TravellrsRouter.use('/markers', MarkersRouter);
