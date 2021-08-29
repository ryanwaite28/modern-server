import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { ListingsRouter } from './routers/listings.router';

export const BlueworldRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

BlueworldRouter.use('/users', UsersRouter);
BlueworldRouter.use('/listings', ListingsRouter);