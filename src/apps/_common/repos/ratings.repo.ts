import {
  fn,
  col,
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
import { IModelRating, IUser } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { IMyModel, MyModelStatic } from '../models/common.model-types';




export function get_rating_by_id_via_model(ratingsModel: MyModelStatic, id: number): Promise<IModelRating> {
  return ratingsModel.findOne({
    where: { id }
  })
  .then((model: IMyModel | null) => {
    return convertModel<IModelRating>(model)!;
  });
}

export function get_user_ratings_via_model(ratingsModel: MyModelStatic, id: number): Promise<IModelRating[]> {
  return ratingsModel.findAll({
    where: { user_id: id },
    limit: 10,
    order: [['id', 'DESC']]
  })
  .then((models) => {
    return convertModels<IModelRating>(models);
  });
}

export function get_writer_ratings_via_model(ratingsModel: MyModelStatic, id: number): Promise<IModelRating[]> {
  return ratingsModel.findAll({
    where: { writer_id: id },
    limit: 10,
    order: [['id', 'DESC']]
  })
  .then((models) => {
    return convertModels<IModelRating>(models);
  });
}

export function create_rating_via_model(ratingsModel: MyModelStatic, data: any): Promise<IModelRating> {
  return ratingsModel.create(data)
    .then((model: IMyModel) => {
      return convertModel<IModelRating>(model)!;
    });
}

export async function get_user_ratings_stats_via_model(ratingsModel: MyModelStatic, id: number): Promise<{
  user_ratings_info: IModelRating | null,
  writer_ratings_info: IModelRating | null,
}> {
  const user_ratings_info = await ratingsModel.findOne({
    where: { user_id: id },
    attributes: [
      [fn('AVG', col('rating')), 'ratingsAvg'],
      [fn('COUNT', col('rating')), 'ratingsCount'],
    ],
    group: ['user_id'],
  })
  .then((model: IMyModel | null) => {
    return convertModel<IModelRating>(model);
  });

  const writer_ratings_info = await ratingsModel.findOne({
    where: { writer_id: id },
    attributes: [
      [fn('AVG', col('rating')), 'ratingsAvg'],
      [fn('COUNT', col('rating')), 'ratingsCount'],
    ],
    group: ['writer_id'],
  })
  .then((model: IMyModel | null) => {
    return convertModel<IModelRating>(model)!;
  });

  return {
    user_ratings_info,
    writer_ratings_info,
  }
}