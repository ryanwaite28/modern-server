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

import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import {
  Delivery,
  DeliveryMessages,
  DeliveryTrackingUpdates
} from '../models/delivery.model';
import { ICreateDeliveryProps, ICreateDeliveryTrackingUpdateProps } from '../interfaces/deliverme.interface';
import { DeliverMeUserProfileSettings } from '../models/deliverme.model';


export const deliveryTrackingOrderBy: Order = [
  [DeliveryTrackingUpdates, 'id', 'DESC']
];

export const deliveryMasterIncludes: Includeable[] = [{
  model: Users,
  as: 'owner',
  attributes: user_attrs_slim,
  include: [{
    model: DeliverMeUserProfileSettings,
    as: 'deliverme_settings',
  }]
}, {
  model: Users,
  as: 'carrier',
  attributes: user_attrs_slim,
  include: [{
    model: DeliverMeUserProfileSettings,
    as: 'deliverme_settings',
  }]
}, {
  model: DeliveryTrackingUpdates,
  as: 'deliverme_delivery_tracking_updates',
  include: [{
    model: Users,
    as: 'user',
    attributes: user_attrs_slim
  }]
}, {
  model: DeliveryMessages,
  as: 'delivery_messages',
  include: [{
    model: Users,
    as: 'user',
    attributes: user_attrs_slim
  }]
}];

export const deliveryGeneralIncludes: Includeable[] = [{
  model: Users,
  as: 'owner',
  attributes: user_attrs_slim,
  include: [{
    model: DeliverMeUserProfileSettings,
    as: 'deliverme_settings',
  }]
}, {
  model: Users,
  as: 'carrier',
  attributes: user_attrs_slim,
  include: [{
    model: DeliverMeUserProfileSettings,
    as: 'deliverme_settings',
  }]
}];


export async function get_delivery_by_id(id: number) {
  const delivery = await Delivery.findOne({
    where: { id },
    include: deliveryMasterIncludes,
    order: deliveryTrackingOrderBy,
  });
  return delivery;
}

export async function create_delivery(createObj: ICreateDeliveryProps) {
  const new_delivery_model = await Delivery.create(<any> createObj);
  const delivery = await get_delivery_by_id(new_delivery_model.get('id'));
  return delivery!;
}

export async function update_delivery(id: number, updateObj: Partial<ICreateDeliveryProps>) {
  const updates = await Delivery.update(<any> updateObj, { where: { id } });
  const delivery = await get_delivery_by_id(id);
  return {
    updates,
    delivery
  };
}

export async function delete_delivery(id: number) {
  const deletes = await Delivery.destroy({ where: { id } });
  return deletes;
}




export async function get_delivery_tracking_updates(delivery_id: number) {
  const tracking_update = await DeliveryTrackingUpdates.findAll({
    where: { delivery_id },
    include: []
  });
  return tracking_update;
}

export async function get_delivery_tracking_update_by_id(id: number) {
  const tracking_update = await DeliveryTrackingUpdates.findOne({
    where: { id, deleted_at: null },
    include: []
  });
  return tracking_update;
}

export async function create_delivery_tracking_update(createObj: ICreateDeliveryTrackingUpdateProps) {
  const new_delivery_tracking_update_model = await DeliveryTrackingUpdates.create(<any> createObj);
  const id = new_delivery_tracking_update_model.get('id') as number;
  // const tracking_update = await DeliveryTrackingUpdates.findOne({
  //   where: { id },
  //   include: []
  // });
  return new_delivery_tracking_update_model;
}