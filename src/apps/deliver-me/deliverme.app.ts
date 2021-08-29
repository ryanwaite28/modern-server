import { Router } from 'express';
import { UsersRouter } from './routers/users.router';
import { DeliveriesRouter } from './routers/deliveries.router';

export const DeliverMeRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

DeliverMeRouter.use('/users', UsersRouter);
DeliverMeRouter.use('/deliveries', DeliveriesRouter);