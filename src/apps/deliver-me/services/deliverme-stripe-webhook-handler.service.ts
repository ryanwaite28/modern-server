import { validatePhone } from "../../_common/common.chamber";
import { MODERN_APP_NAMES } from "../../_common/enums/common.enum";
import { create_notification } from "../../_common/repos/notifications.repo";
import { CommonSocketEventsHandler } from "../../_common/services/socket-events-handlers-by-app/common.socket-event-handler";
import { send_sms } from "src/sms-client";
import { populate_deliverme_notification_obj } from "../deliverme.chamber";
import { DELIVERME_NOTIFICATION_TARGET_TYPES, DELIVERME_EVENT_TYPES } from "../enums/deliverme.enum";
import { Delivery } from "../models/delivery.model";
import { get_delivery_by_id } from "../repos/deliveries.repo";


export class DelivermeStripeWebhookHandlerService {
  static async payment_intent_succeeded(userPaymentIntentObj: any, stripePaymentIntent: any) {
    switch (userPaymentIntentObj.target_type) {
      case DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY: {
        const updates = await Delivery.update({ completed: true }, { where: { id: userPaymentIntentObj.target_id } });
        console.log(`delivery updates:`, { updates });

        const data = await get_delivery_by_id(userPaymentIntentObj.target_id);
        const deliveryObj: any = data!.toJSON();

        // notify carrier
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

  // private internal handling
}