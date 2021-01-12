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
import { RecipeComments } from '../models/recipe.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../chamber';
import { PlainObject } from '../interfaces/all.interface';

export async function get_comment_by_id(id: number) {
  const comment = await RecipeComments.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }]
  });
  return comment;
}

export async function create_comment(createObj: {
  owner_id: number,
  recipe_id: number,
  body: string,
}) {
  const new_comment_model = await RecipeComments.create({
    recipe_id: createObj.recipe_id,
    owner_id: createObj.owner_id,
    body: createObj.body,
  });
  const comment = await get_comment_by_id(new_comment_model.get('id'));
  return comment;
}

export async function update_comment(
  updatesObj: {
    body: string,
  },
  id: number
) {
  const updates = await RecipeComments.update({
    body: updatesObj.body,
  }, { where: { id } });
  return updates;
}

export async function delete_comment(id: number) {
  const deletes = await RecipeComments.destroy({ where: { id } });
  return deletes;
}