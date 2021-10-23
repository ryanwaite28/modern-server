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
import { PlainObject } from '../interfaces/common.interface';

export async function paginateTable<T = IMyModel>(
  model: MyModelStaticGeneric<IMyModel>,
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
  const models = await (<any> model).findAll({
    attributes,
    group,
    where: useWhereClause,
    include: include || [],
    limit: 5,
    order: orderBy || [['id', 'DESC']]
  });
  return models;
}

export async function getAll<T = IMyModel>(
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
  model: MyModelStaticGeneric<T>,
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

  const result = await (<any> model).findOne({
    attributes,
    group,
    where: useWhereClause,
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