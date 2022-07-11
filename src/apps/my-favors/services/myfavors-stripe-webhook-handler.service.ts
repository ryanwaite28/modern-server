import { getUserFullName, validatePhone } from "../../_common/common.chamber";
import { COMMON_TRANSACTION_STATUS, MODERN_APP_NAMES } from "../../_common/enums/common.enum";
import { create_notification } from "../../_common/repos/notifications.repo";
import { CommonSocketEventsHandler } from "../../_common/services/socket-events-handlers-by-app/common.socket-event-handler";
import { send_sms } from "../../../sms-client";
import { MYFAVORS_NOTIFICATION_TARGET_TYPES, MYFAVORS_EVENT_TYPES } from "../enums/myfavors.enum";
import { populate_myfavors_notification_obj } from "../myfavors.chamber";
import { FavorHelpers, Favors } from "../models/favor.model";
import { get_favor_by_id } from "../repos/favors.repo";
import { get_user_by_id } from "../../_common/repos/users.repo";
import { IUser } from "../../_common/interfaces/common.interface";
import { UserPaymentIntents } from "../../_common/models/user.model";


export class MyfavorsStripeWebhookHandlerService {
  static async payment_intent_succeeded(userPaymentIntentObj: any, stripePaymentIntent: any) {
    const helper_user = await get_user_by_id(stripePaymentIntent.metadata.helper_user_id);

    console.log(`myfavors - favor paid to helper`, {
      userPaymentIntentObj,
      stripePaymentIntent,
      helper_user,
    });

    switch (userPaymentIntentObj.target_type) {
      case MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR: {
        const favor_model = await get_favor_by_id(userPaymentIntentObj.target_id);
        const favorObj: any = favor_model!.toJSON();

        const helper_model = await FavorHelpers.findOne({
          where: { favor_id: favorObj.id, user_id: helper_user!.id }
        });

        const helper_updates = await helper_model!.update({
          paid: true,
          payment_intent_id: stripePaymentIntent.id,
        });

        console.log({ helper_updates });

        const userPaymentIntentUpdate = await UserPaymentIntents.update({
          status: COMMON_TRANSACTION_STATUS.COMPLETED
        }, {
          where: {
            payment_intent_id: stripePaymentIntent.id,
          }
        });

        console.log({ userPaymentIntentUpdate });

        // notify owner that payment was successful
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: favorObj.owner_id,
          event: MYFAVORS_EVENT_TYPES.FAVOR_HELPER_PAID,
          event_data: {
            data: favorObj,
            helper_user,
            message: `Favor helper ${getUserFullName(helper_user!)} paid`,
            // notification,
          }
        });

        // notify helper
        create_notification({
          from_id: favorObj.owner_id,
          to_id: helper_user!.id,
          event: MYFAVORS_EVENT_TYPES.FAVOR_HELPER_PAID,
          micro_app: MODERN_APP_NAMES.MYFAVORS,
          target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
          target_id: favorObj.id
        }).then(async (notification_model) => {
          // const notification = await populate_myfavors_notification_obj(notification_model);
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: helper_user!.id,
            event: MYFAVORS_EVENT_TYPES.FAVOR_HELPER_PAID,
            event_data: {
              data: favorObj,
              helper_user,
              message: `Favor helper ${getUserFullName(helper_user!)} paid`,
              // notification,
            }
          });

          const to_phone_number = helper_user!.phone;
          if (validatePhone(to_phone_number)) {
            send_sms({
              to_phone_number,
              message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: Favor helper ${getUserFullName(helper_user!)} paid`
            });
          }
        });
      }
    }
  }

  // private internal handling
}