import { corsMiddleware } from './_common/common.chamber';
import { Router } from 'express';

import { CommonRouter } from './_common/common.app';

import { BlueworldRouter } from './blue-world/blueworld.app';
import { HotspotRouter } from './hotspot/hotspot.app';
import { MyfavorsRouter } from './my-favors/myfavors.app';
import { TravellrsRouter } from './travellrs/travellrs.app';
import { WorldNewsRouter } from './world-news/worldnews.app';
import { DeliverMeRouter } from './deliver-me/deliverme.app';




// create main apps router

export const AppsRouter: Router = Router({ mergeParams: true });
AppsRouter.options(`*`, corsMiddleware);

// Mount Apps

AppsRouter.use('/common', corsMiddleware, CommonRouter);

AppsRouter.use('/hotspot', corsMiddleware, HotspotRouter);
AppsRouter.use('/deliverme', corsMiddleware, DeliverMeRouter);
AppsRouter.use('/travellrs', corsMiddleware, TravellrsRouter);
AppsRouter.use('/worldnews', corsMiddleware, WorldNewsRouter);





/*
Deactivated/Disabled apps
---

AppsRouter.use('/myfavors', MyfavorsRouter);
AppsRouter.use('/blueworld', BlueworldRouter);

*/