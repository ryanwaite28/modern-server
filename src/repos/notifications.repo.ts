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
import { Notifications } from '../models/user.model';
import {
  EVENT_TYPES,
  NOTIFICATION_TARGET_TYPES
} from '../chamber';
import { PlainObject } from '../interfaces/all.interface';

export async function create_notification(
  params: {
    from_id: number;
    to_id: number;
    event: EVENT_TYPES;
    target_type: NOTIFICATION_TARGET_TYPES | null;
    target_id?: number | null;
  }
) {
  const new_notification_model = await Notifications.create(params);
  return new_notification_model;
}

export async function get_user_unseen_notifications_count(you_id: number, last_seen: string | Date) {
  const count = await Notifications.count({
    where: { to_id: you_id, date_created: { [Op.gt]: last_seen } },
  });

  return count;
}