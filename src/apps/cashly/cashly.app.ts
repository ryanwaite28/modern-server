import { Router, Request, Response } from 'express';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';

export const CashlyRouter: Router = Router({ mergeParams: true });
CashlyRouter.use(bodyParser.json());
CashlyRouter.options(`*`, corsMiddleware);

/** Mount Routers */

// CashlyRouter.use('/users', corsMiddleware, UsersRouter);