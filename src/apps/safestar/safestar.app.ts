import { Router } from 'express';
import * as bodyParser from 'body-parser';
import { corsMiddleware } from '../_common/common.chamber';
import { MobileRouter, WebRouter } from './safestar.router';


// Router
export const SafestarRouter: Router = Router({ mergeParams: true });
SafestarRouter.use(bodyParser.json());

SafestarRouter.options(`*`, corsMiddleware);

SafestarRouter.use('/', WebRouter);
SafestarRouter.use('/mobile', MobileRouter);