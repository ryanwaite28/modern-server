import { MyModelStaticGeneric } from '../model-types';
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
import { PlainObject } from '../interfaces/all.interface';

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
  const whereCaluse: WhereOptions = whereClause || <PlainObject> (!min_id
    ? { [(user_id_field || '')]: user_id }
    : { [(user_id_field || '')]: user_id, id: { [Op.lt]: min_id } });
  const models = await model.findAll<Model<T>>({
    attributes,
    group,
    where: whereCaluse,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  });
  return models;
}

export async function getAll<T>(
  model: MyModelStaticGeneric<T>,
  user_id_field: string,
  user_id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
)  {
  const models = await model.findAll<Model<T>>({
    attributes,
    group,
    where: { [user_id_field]: user_id },
    include: include || [],
    order: [['id', 'DESC']]
  });
  return models;
}

export async function getById<T>(
  model: MyModelStaticGeneric<T>,
  id: number,
  include?: Includeable[],
  attributes?: FindAttributeOptions,
  group?: GroupOption,
)  {
  const result = await model.findOne<Model<T>>({
    attributes,
    group,
    where: { id },
    include: include || [],
  });
  return result;
}