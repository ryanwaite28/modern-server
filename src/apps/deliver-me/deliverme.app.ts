import { Router, Request, Response } from 'express';
import { UsersRouter } from './routers/users.router';
import { DeliveriesRouter } from './routers/deliveries.router';
import { corsMiddleware } from '../_common/common.chamber';
import { StripeService } from '../_common/services/stripe.service';

export const DeliverMeRouter: Router = Router({ mergeParams: true });

/** Mount Routers */

DeliverMeRouter.use('/users', UsersRouter);
DeliverMeRouter.use('/deliveries', DeliveriesRouter);