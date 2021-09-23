import { corsMiddleware, validatePhone } from './_common/common.chamber';
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

import { StripeService } from './_common/services/stripe.service';
import { UserPaymentIntents } from './_common/models/user.model';
import { MODERN_APP_NAMES } from './_common/enums/common.enum';
import { DELIVERME_EVENT_TYPES, DELIVERME_NOTIFICATION_TARGET_TYPES } from './deliver-me/enums/deliverme.enum';
import { Delivery } from './deliver-me/models/delivery.model';
import { get_delivery_by_id } from './deliver-me/repos/deliveries.repo';
import { create_notification } from './_common/repos/notifications.repo';
import { populate_deliverme_notification_obj } from './deliver-me/deliverme.chamber';
import { CommonSocketEventsHandler } from './_common/services/socket-events-handlers-by-app/common.socket-event-handler';
import { send_sms } from '../sms-client';


// create main apps router

export const AppsRouter: Router = Router({ mergeParams: true });
AppsRouter.options(`*`, corsMiddleware);

// Mount Apps

AppsRouter.use('/common', bodyParser.json(), corsMiddleware, CommonRouter);

AppsRouter.use('/hotspot', bodyParser.json(), corsMiddleware, HotspotRouter);
AppsRouter.use('/deliverme', bodyParser.json(), corsMiddleware, DeliverMeRouter);
AppsRouter.use('/travellrs', bodyParser.json(), corsMiddleware, TravellrsRouter);
AppsRouter.use('/worldnews', bodyParser.json(), corsMiddleware, WorldNewsRouter);
AppsRouter.use('/contender', bodyParser.json(), corsMiddleware, ContenderRouter);



AppsRouter.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (request: Request, response: Response) => {
  console.log(`-------stripe webhook request:-------`, request.body, request.headers);
  
  const sig = request.headers['stripe-signature'];

  let event;

  // Verify webhook signature and extract the event.
  // See https://stripe.com/docs/webhooks/signatures for more information.
  try {
    event = StripeService.stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SIG!);
  } catch (err) {
    const errMsg = `Webhook Error: ${(<any> err).message}`;
    console.log(errMsg);
    return response.status(400).send(errMsg);
  }

  console.log(`stripe webhook event:`, { event });

  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userPaymentIntent = await UserPaymentIntents.findOne({ where: { payment_intent_id: paymentIntent.id } });
    if (userPaymentIntent) {
      const userPaymentIntentObj: any = userPaymentIntent.toJSON();
      switch (userPaymentIntentObj.micro_app) {
        case MODERN_APP_NAMES.DELIVERME: {
          switch (userPaymentIntentObj.target_type) {
            case DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY: {
              const updates = await Delivery.update({ completed: true }, { where: { id: userPaymentIntentObj.target_id } });
              console.log(`delivery updates:`, { updates });

              const data = await get_delivery_by_id(userPaymentIntentObj.target_id);
              const deliveryObj: any = data!.toJSON();

              create_notification({
                from_id: deliveryObj.owner_id,
                to_id: deliveryObj.carrier_id,
                event: DELIVERME_EVENT_TYPES.DELIVERY_COMPLETED,
                micro_app: MODERN_APP_NAMES.DELIVERME,
                target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
                target_id: deliveryObj.id
              }).then(async (notification_model) => {
                const notification = await populate_deliverme_notification_obj(notification_model);
                CommonSocketEventsHandler.emitEventToUserSockets({
                  user_id: deliveryObj.carrier_id,
                  event: DELIVERME_EVENT_TYPES.DELIVERY_COMPLETED,
                  data: {
                    data,
                    message: `Delivery completed!`,
                    user: deliveryObj.owner,
                    notification,
                  }
                });

                const to_phone_number = deliveryObj.carrier.deliverme_settings.phone || deliveryObj.carrier.phone;
                if (validatePhone(to_phone_number)) {
                  send_sms({
                    to_phone_number,
                    message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
                  });
                }
              });
            }
          }
        }
      }
    }
  }
  

  return response.json({ received: true });
});


/*
Deactivated/Disabled apps
---

AppsRouter.use('/myfavors', MyfavorsRouter);
AppsRouter.use('/blueworld', BlueworldRouter);

*/