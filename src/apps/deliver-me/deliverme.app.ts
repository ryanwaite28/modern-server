import { Router, Request, Response } from 'express';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

import { UsersRouter } from './routers/users.router';
import { DeliveriesRouter } from './routers/deliveries.router';
import { ApiKeyAuthorized } from '../_common/guards/api-key.guard';
import { DelivermeApiRouter } from './routers/deliverme-api.router';



export const DeliverMeRouter: Router = Router({ mergeParams: true });
DeliverMeRouter.use(bodyParser.json());
DeliverMeRouter.options(`*`, corsMiddleware);

/** Mount Routers */

DeliverMeRouter.use('/users', corsMiddleware, UsersRouter);
DeliverMeRouter.use('/deliveries', corsMiddleware, DeliveriesRouter);

DeliverMeRouter.use('/api', ApiKeyAuthorized, DelivermeApiRouter);