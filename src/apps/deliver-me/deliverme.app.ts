import { Router, Request, Response } from 'express';
import { UsersRouter } from './routers/users.router';
import { DeliveriesRouter } from './routers/deliveries.router';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const DeliverMeRouter: Router = Router({ mergeParams: true });
DeliverMeRouter.use(bodyParser.json());
DeliverMeRouter.options(`*`, corsMiddleware);

/** Mount Routers */

DeliverMeRouter.use('/users', corsMiddleware, UsersRouter);
DeliverMeRouter.use('/deliveries', corsMiddleware, DeliveriesRouter);