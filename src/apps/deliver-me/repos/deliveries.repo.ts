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
import {
  convertModel,
  convertModelCurry,
  convertModels,
  convertModelsCurry,
  user_attrs_slim
} from '../../_common/common.chamber';
import { IUser } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import {
  Delivery,
  DeliveryMessages,
  DeliveryTrackingUpdates
} from '../models/delivery.model';
import {
  ICreateDeliveryProps,
  ICreateDeliveryTrackingUpdateProps,
  IDelivery,
  IDeliveryMessage,
  IDeliveryTrackingUpdate
} from '../interfaces/deliverme.interface';
import { DeliverMeUserProfileSettings } from '../models/deliverme.model';
import { delivery_search_attrs } from '../deliverme.chamber';
import { IMyModel } from 'src/apps/_common/models/common.model-types';





export const deliveryOrderBy: Order = [
  ['id', 'DESC']
];

export const deliveryTrackingOrderBy: Order = [
  [DeliveryTrackingUpdates, 'id', 'DESC']
];

const convertDeliveryModel = convertModelCurry<IDelivery>();
const convertDeliveryModels = convertModelsCurry<IDelivery>();

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





// Repo Functions

export function get_delivery_by_id(id: number): Promise<IDelivery | null> {
  return Delivery.findOne({
    where: { id },
    include: deliveryMasterIncludes,
    order: deliveryTrackingOrderBy,
  })
  .then(convertDeliveryModel);
}

export async function create_delivery(
  createObj: ICreateDeliveryProps
): Promise<IDelivery> {
  return Delivery.create(<any> createObj, {
    include: deliveryMasterIncludes,
  })
  .then((model: IMyModel) => convertDeliveryModel(model)!);
}

export async function update_delivery(
  id: number, 
  updateObj: Partial<ICreateDeliveryProps>
): Promise<{updates: number, delivery: IDelivery}> {
  const updates = await Delivery.update(<any> updateObj, { where: { id } });
  const delivery = await get_delivery_by_id(id);
  return {
    updates: updates[0],
    delivery: delivery!
  };
}

export function delete_delivery(id: number): Promise<number> {
  return Delivery.destroy({ where: { id } });
}

export function find_available_delivery_by_from_city_and_state(
  city: string, 
  state: string
): Promise<IDelivery | null> {
  return Delivery.findOne({
    where: {
      carrier_id: null,
      completed: false,
      from_city: city,
      from_state: state,
    },
    order: [fn('RANDOM')],
    include: deliveryMasterIncludes,
  })
  .then(convertDeliveryModel);
}

export function find_available_delivery_by_to_city_and_state(
  city: string, 
  state: string
): Promise<IDelivery | null> {
  return Delivery.findOne({
    where: {
      carrier_id: null,
      completed: false,
      to_city: city,
      to_state: state,
    },
    order: [fn('RANDOM')],
    include: deliveryMasterIncludes
  })
  .then(convertDeliveryModel);
}

export function find_available_delivery(params: {
  you_id: number,
  where: {
    from_city?: string,
    from_state?: string,
    to_city?: string,
    to_state?: string,
  }
}): Promise<IDelivery | null> {
  return Delivery.findOne({
    where: {
      owner_id: {
        [Op.ne]: params.you_id
      },
      carrier_id: null,
      completed: false,
      ...params.where
    },
    order: [fn('RANDOM')],
    include: deliveryMasterIncludes
  })
  .then(convertDeliveryModel);
}

export async function search_deliveries(params: {
  you_id: number,
  from_city: string,
  from_state: string,
  to_city: string,
  to_state: string,
}): Promise<IDelivery[]> {
  const {
    you_id,
    from_city,
    from_state,
    to_city,
    to_state,
  } = params;

  const fromValid = from_city && from_state;
  const toValid = to_city && to_state;
  const fromAndToValid = fromValid && toValid;

  let results: IMyModel[] | undefined;

  if (!fromValid && !toValid) {
    results = await Delivery.findAll({
      where: { completed: false, carrier_id: null, owner_id: { [Op.ne]: you_id } },
      attributes: delivery_search_attrs,
      limit: 5,
      order: [fn('RANDOM')]
    });
  }
  else if (fromValid && !toValid) {
    results = await Delivery.findAll({
      where: { from_city, from_state, completed: false, carrier_id: null, owner_id: { [Op.ne]: you_id } },
      attributes: delivery_search_attrs,
      limit: 5,
      order: [fn('RANDOM')]
    });
  }
  else if (!fromValid && toValid) {
    results = await Delivery.findAll({
      where: { to_city, to_state, completed: false, carrier_id: null, owner_id: { [Op.ne]: you_id } },
      attributes: delivery_search_attrs,
      limit: 5,
      order: [fn('RANDOM')]
    });
  }
  else if (fromAndToValid) {
    results = await Delivery.findAll({
      where: { from_city, from_state, to_city, to_state, completed: false, carrier_id: null, owner_id: { [Op.ne]: you_id } },
      attributes: delivery_search_attrs,
      limit: 5,
      order: [fn('RANDOM')]
    });
  }

  return results
    ? results.map((model) => model.toJSON() as IDelivery)
    : [];
}

export function get_delivery_tracking_updates(
  delivery_id: number
): Promise<IDeliveryTrackingUpdate[]> {
  return DeliveryTrackingUpdates.findAll({
    where: { delivery_id },
    include: []
  })
  .then((models: IMyModel[]) => convertModels<IDeliveryTrackingUpdate>(models));
}

export async function get_delivery_tracking_update_by_id(
  id: number
): Promise<IDeliveryTrackingUpdate | null> {
  return DeliveryTrackingUpdates.findOne({
    where: { id, deleted_at: null },
    include: []
  })
  .then((model: IMyModel | null) => convertModel<IDeliveryTrackingUpdate>(model));
}

export function create_delivery_tracking_update(
  createObj: ICreateDeliveryTrackingUpdateProps
): Promise<IDeliveryTrackingUpdate> {
  return DeliveryTrackingUpdates.create(<any> createObj)
    .then((model: IMyModel) => convertModel<IDeliveryTrackingUpdate>(model)!);
}

export function browse_recent_deliveries(
  you_id?: number,
  delivery_id?: number
): Promise<IDelivery[]> {
  const useWhere: any = {
    completed: false,
    carrier_id: null,
  };
  if (you_id) {
    useWhere.owner_id = { [Op.ne]: you_id };
  }
  if (delivery_id) {
    useWhere.delivery_id = { [Op.lt]: delivery_id };
  }

  const findQuery = {
    where: useWhere,
    include: deliveryMasterIncludes,
    order: deliveryTrackingOrderBy,
    limit: 10,
  };

  return Delivery.findAll(findQuery).then(convertDeliveryModels);
}

export function browse_featured_deliveries(
  you_id?: number,
  delivery_id?: number
): Promise<IDelivery[]> {
  const useWhere: any = {
    completed: false,
    carrier_id: null,
  };
  if (you_id) {
    useWhere.owner_id = { [Op.ne]: you_id };
  }
  if (delivery_id) {
    useWhere.delivery_id = { [Op.lt]: delivery_id };
  }

  const findQuery = {
    where: useWhere,
    include: deliveryMasterIncludes,
    order: deliveryTrackingOrderBy,
    limit: 10,
  };

  return Delivery.findAll(findQuery).then(convertDeliveryModels);
}

export function browse_map_deliveries(params: {
  you_id: number,
  swLat: number,
  swLng: number,
  neLat: number,
  neLng: number,
}): Promise<IDelivery[]> {
  // https://stackoverflow.com/questions/4834772/get-all-records-from-mysql-database-that-are-within-google-maps-getbounds
  // swlat, swlng, nelat, nelng = a, b, c, d.

  const useLatBetween = params.swLat < params.neLat
    // ? [params.swLat, params.neLat]
    ? { [Op.gt]: params.swLat, [Op.lt]: params.neLat }
    // : [params.neLat, params.swLat];
    : { [Op.gt]: params.neLat, [Op.lt]: params.swLat };

  const useLngBetween = params.swLng < params.neLng
    // ? [params.swLng, params.neLng]
    ? { [Op.gt]: params.swLng, [Op.lt]: params.neLng }
    // : [params.neLng, params.swLng];
    : { [Op.gt]: params.neLng, [Op.lt]: params.swLng };

  const useWhere: any = {
    completed: false,
  };
  useWhere.from_lat = useLatBetween;
  useWhere.from_lng = useLngBetween;

  if (params.you_id) {
    useWhere.owner_id = { [Op.ne]: params.you_id };
    useWhere[Op.or] = [{ carrier_id: null }, { carrier_id: {[Op.ne]: params.you_id} }];
  } else {
    useWhere.carrier_id = null;
  }

  console.log({ params, useWhere }); 

  const findQuery = {
    where: useWhere,
    include: deliveryMasterIncludes,
    order: deliveryTrackingOrderBy,
  };

  return Delivery.findAll(findQuery).then(convertDeliveryModels);
}

export function create_delivery_message(params: {
  body: string,
  delivery_id: number,
  user_id: number
}): Promise<IDeliveryMessage> {
  return DeliveryMessages.create(params)
    .then((new_model: IMyModel) => {
      return DeliveryMessages.findOne({
        where: { id: new_model.get('id') },
        include: [{
          model: Users,
          as: 'user',
          attributes: user_attrs_slim
        }]
      })
      .then((model: IMyModel | null) => {
        return convertModel<IDeliveryMessage>(model)!
      });
    });
}

export function get_user_deliveries_count(user_id: number): Promise<number> {
  return Delivery.count({
    where: { owner_id: user_id }
  });
}

export function get_user_delivering_completed_count(user_id: number): Promise<number> {
  return Delivery.count({
    where: { carrier_id: user_id, completed: true }
  });
}

export function get_user_delivering_inprogress_count(user_id: number): Promise<number> {
  return Delivery.count({
    where: { carrier_id: user_id, completed: false }
  });
}