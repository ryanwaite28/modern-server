import {
  fn,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order
} from 'sequelize';
import { send_sms } from '../../../sms-client';
import { validatePhone } from '../common.chamber';
import { INotification, INotificationPopulateFn, PlainObject } from '../interfaces/common.interface';
import { IMyModel } from '../models/common.model-types';
import { Notifications } from '../models/user.model';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';

export async function create_notification(
  params: {
    from_id: number;
    to_id: number;
    event: string;
    micro_app: string;
    target_type: string;
    target_id: number;
  }
) {
  const new_notification_model = await Notifications.create(<any> params);
  return new_notification_model;
}

export async function create_notification_and_send(
  params: {
    from_id: number;
    to_id: number;
    event: string;
    micro_app: string;
    target_type: string;
    target_id: number;

    notification_populate_fn: INotificationPopulateFn,
    to_phone?: string,
    extras_data?: PlainObject,
  }
) {
  return Notifications.create(<any> {
    from_id: params.from_id,
    to_id: params.to_id,
    event: params.event,
    micro_app: params.micro_app,
    target_type: params.target_type,
    target_id: params.target_id,
  }).then(async (notification_model) => {
    const notification = await params.notification_populate_fn(notification_model);
    
    const event_data: any = {
      from_id: params.from_id,
      to_id: params.to_id,
      event: params.event,
      micro_app: params.micro_app,
      target_type: params.target_type,
      target_id: params.target_id,

      message: notification.message,
      notification,
    };
    
    if (params.extras_data) {
      Object.assign(event_data, params.extras_data);
    }
    
    CommonSocketEventsHandler.emitEventToUserSockets({
      user_id: params.to_id,
      event: params.event,
      event_data,
    });

    if (!!params.to_phone && validatePhone(params.to_phone)) {
      send_sms({
        to_phone_number: params.to_phone,
        message: `ModernApps ${params.micro_app} - ` + notification.message,
      });
    }
  });
}

export async function get_user_unseen_notifications_count(you_id: number, last_seen: string | Date) {
  const count = await Notifications.count({
    where: { to_id: you_id, date_created: { [Op.gt]: last_seen } },
  });

  return count;
}