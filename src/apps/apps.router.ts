import { Router, Request, Response } from 'express';
import * as bodyParser from 'body-parser';

import { CommonRouter } from './_common/common.app';

import { BlueworldRouter } from './blue-world/blueworld.app';
import { HotspotRouter } from './hotspot/hotspot.app';
import { MyfavorsRouter } from './my-favors/myfavors.app';
import { TravellrsRouter } from './travellrs/travellrs.app';
import { WorldNewsRouter } from './world-news/worldnews.app';
import { DeliverMeRouter } from './deliver-me/deliverme.app';
import { ContenderRouter } from './contender/contender.app';
import { CashlyRouter } from './cashly/cashly.app';

import { StripeService } from './_common/services/stripe.service';
import { StripeWebhookEventsRequestHandler } from './_common/handlers/stripe-webhook-events.handler';


// create main apps router

export const AppsRouter: Router = Router({ mergeParams: true });
// AppsRouter.options('*', corsMiddleware);

// Mount Apps

AppsRouter.use('/common', CommonRouter);
AppsRouter.use('/deliverme', DeliverMeRouter);
AppsRouter.use('/travellrs', TravellrsRouter);
AppsRouter.use('/cashly', CashlyRouter);




AppsRouter.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (request: Request, response: Response) => {
  console.log(`-------stripe webhook request:-------`, request.body, request.headers);
  
  const stripe_signature = request.get('stripe-signature') ?? '';
  
  let event;
  
  // Verify webhook signature and extract the event.
  // See https://stripe.com/docs/webhooks/signatures for more information.
  try {
    event = StripeService.stripe.webhooks.constructEvent(request.body, stripe_signature, process.env.STRIPE_WEBHOOK_SIG!);
  } catch (err) {
    const errMsg = `Webhook Error: ${(<any> err).message}`;
    console.log(errMsg);
    return response.status(400).send(errMsg);
  }
  
  console.log(`stripe webhook event:`, { event });
  
  return StripeWebhookEventsRequestHandler.handleEvent(event, request, response);
});


/*
Deactivated/Disabled apps
---

AppsRouter.use('/hotspot', HotspotRouter);
AppsRouter.use('/worldnews', WorldNewsRouter);
AppsRouter.use('/contender', ContenderRouter);
AppsRouter.use('/myfavors', MyfavorsRouter);
AppsRouter.use('/blueworld', BlueworldRouter);

*/