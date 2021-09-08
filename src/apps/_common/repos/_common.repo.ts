import { MyModelStaticGeneric } from '../models/common.model-types';
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
import { PlainObject } from '../interfaces/common.interface';

export async function paginateTable<T>(
  model: MyModelStaticGeneric<T>,
  user_id_field?: string,
  user_id?: number,
  min_id?: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  const useWhereClause: WhereOptions = whereClause || <PlainObject> (!min_id
    ? { [(user_id_field || '')]: user_id }
    : { [(user_id_field || '')]: user_id, id: { [Op.lt]: min_id } });
  const models = await (<any> model).findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  });
  return models as Model<T>[];
}

export async function getAll<T>(
  model: MyModelStaticGeneric<T>,
  user_id_field: string,
  user_id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
  orderBy?: Order
)  {
  // const models = await model.findAll<Model<T>>({

  const models = await (<any> model).findAll({
    attributes,
    group,
    where: { ...whereClause, [user_id_field]: user_id },
    include: include || [],
    order: orderBy || [['id', 'DESC']]
  });
  return models as Model<T>[];
}

export async function getById<T>(
  model: MyModelStaticGeneric<T>,
  id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
  whereClause?: WhereOptions,
)  {
  // const result = await model.findOne<Model<T>>({

  const result = await (<any> model).findOne({
    attributes,
    group,
    where: { ...whereClause, id: id },
    include: include || [],
  });
  return result as Model<T>;
}

export async function getRandomModels<T>(
  model: MyModelStaticGeneric<T>,
  limit: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
) {
  try {
    const users = await (<any> model).findAll({
      limit,
      order: [fn( 'RANDOM' )],
      attributes,
      group,
      include,
    });
    return users;
  } catch (e) {
    console.log(`get_random_models error - `, e);
    return null;
  }
}