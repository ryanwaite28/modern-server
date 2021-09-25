import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { ListingsRouter } from './routers/listings.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const BlueworldRouter: Router = Router({ mergeParams: true });
BlueworldRouter.use(bodyParser.json());
BlueworldRouter.options(`*`, corsMiddleware);

/** Mount Routers */

BlueworldRouter.use('/users', corsMiddleware, UsersRouter);
BlueworldRouter.use('/listings', corsMiddleware, ListingsRouter);