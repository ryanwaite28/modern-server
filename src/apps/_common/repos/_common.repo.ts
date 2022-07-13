import { IMyModel, MyModelStatic, MyModelStaticGeneric } from '../models/common.model-types';
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
import { IUserNotificationsLastOpenedByApp, PlainObject } from '../interfaces/common.interface';
import { convertModel, convertModelCurry, convertModels } from '../common.chamber';
import { MODERN_APP_NAMES } from '../enums/common.enum';
import { UserNotificationsLastOpenedByApps } from '../models/user.model';

export async function paginateTable<T>(
  model: MyModelStatic,
  user_id_field: string,
  user_id?: number,
  min_id?: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  const useWhereClause: WhereOptions = <PlainObject> (!min_id
    ? { [user_id_field]: user_id }
    : { [user_id_field]: user_id, id: { [Op.lt]: min_id } }
  );
  if (whereClause) {
    Object.assign(useWhereClause, whereClause);
  }

  console.log(whereClause, { useWhereClause });

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  });

  return models;
}

export async function getAll<T>(
  model: MyModelStaticGeneric<IMyModel>,
  user_id_field: string,
  user_id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  // const models = await model.findAll<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, [user_id_field]: user_id }
    : { [user_id_field]: user_id };

  if (whereClause) {
    Object.assign(useWhereClause, whereClause);
  }
  console.log(whereClause, { useWhereClause });

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    order: orderBy || [['id', 'DESC']]
  });

  return models;
}

export async function getById<T>(
  model: MyModelStatic,
  id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
)  {
  // const result = await model.findOne<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, id }
    : { id };

  console.log(whereClause, { useWhereClause });

  const result = await model.findOne({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
  });

  return result;
}

export async function getRandomModels<T>(
  model: MyModelStaticGeneric<T>,
  limit: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
) {
  try {
    const results = await (<any> model).findAll({
      limit,
      order: [fn( 'RANDOM' )],
      attributes,
      group,
      include,
    });

    return results;
  } 
  catch (e) {
    console.log(`get_random_models error - `, e);
    return null;
  }
}





// converted

export async function paginateTableConverted<T>(
  model: MyModelStatic,
  user_id_field: string,
  user_id?: number,
  min_id?: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  const useWhereClause: WhereOptions = <PlainObject> (!min_id
    ? { [user_id_field]: user_id }
    : { [user_id_field]: user_id, id: { [Op.lt]: min_id } }
  );
  if (whereClause) {
    Object.assign(useWhereClause, whereClause);
  }

  console.log(whereClause, { useWhereClause });

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  })
  .then((models: IMyModel[]) => {
    return convertModels<T>(models);
  });

  return models;
}

export async function getAllConverted<T>(
  model: MyModelStaticGeneric<IMyModel>,
  user_id_field: string,
  user_id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  // const models = await model.findAll<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, [user_id_field]: user_id }
    : { [user_id_field]: user_id };

  if (whereClause) {
    Object.assign(useWhereClause, whereClause);
  }
  console.log(whereClause, { useWhereClause });

  const models = await model.findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    order: orderBy || [['id', 'DESC']]
  });

  return models;
}

export async function getByIdConverted<T>(
  model: MyModelStatic,
  id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
)  {
  // const result = await model.findOne<Model<T>>({
  const useWhereClause = whereClause
    ? { ...whereClause, id }
    : { id };

  console.log(whereClause, { useWhereClause });

  const result = await model.findOne({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
  })
  .then((model: IMyModel | null) => {
    return convertModel<T>(model);
  });

  return result;
}

export async function getRandomModelsConverted<T>(
  model: MyModelStaticGeneric<T>,
  limit: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
) {
  try {
    const results = await (<any> model).findAll({
      limit,
      order: [fn( 'RANDOM' )],
      attributes,
      group,
      include,
    })
    .then((models: IMyModel[]) => {
      return convertModels<T>(models);
    });

    return results;
  } 
  catch (e) {
    console.log(`get_random_models error - `, e);
    return null;
  }
}








export async function get_user_app_notification_last_opened(user_id: number, micro_app: MODERN_APP_NAMES) {
  const converter = convertModelCurry<IUserNotificationsLastOpenedByApp>();
  let data = await UserNotificationsLastOpenedByApps.findOne({ where: { user_id, micro_app: micro_app.toUpperCase() } }).then(converter);

  if (!data) {
    data = await UserNotificationsLastOpenedByApps.create({ user_id, micro_app: micro_app.toUpperCase() }).then(converter);
  }

  console.log(data);

  return data!;
}

export async function update_user_app_notification_last_opened(user_id: number, micro_app: MODERN_APP_NAMES) {
  const converter = convertModelCurry<IUserNotificationsLastOpenedByApp>();
  let data = await UserNotificationsLastOpenedByApps.update({ notifications_last_opened: fn('NOW') }, { returning: true, where: { user_id, micro_app: micro_app.toUpperCase() } }).then(updates => {
    console.log({ user_id, micro_app: micro_app.toUpperCase(), updates });
    const i = converter(updates[1] && updates[1][0]);
    return i;
  });
  
  return data!;
}
