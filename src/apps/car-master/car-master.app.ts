import { Router, Request, Response } from 'express';
import { corsMiddleware } from '../_common/common.chamber';
import * as bodyParser from 'body-parser';
import { CarMasterAppRouter } from './routers/car-master.router';

export const CarMasterRouter: Router = Router({ mergeParams: true });
CarMasterRouter.use(bodyParser.json());
CarMasterRouter.options(`*`, corsMiddleware);

/** Mount Routers */

CarMasterRouter.use('/', corsMiddleware, CarMasterAppRouter);
  