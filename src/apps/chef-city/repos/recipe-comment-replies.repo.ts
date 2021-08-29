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
import { RecipeCommentReplies } from '../models/recipe.model';
import { Users } from '../../_common/models/user.model';
import { user_attrs_slim } from '../../_common/common.chamber';
import { PlainObject } from '../../_common/interfaces/common.interface';

export async function get_reply_by_id(id: number) {
  const reply = await RecipeCommentReplies.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }]
  });
  return reply;
}

export async function create_reply(createObj: {
  owner_id: number,
  comment_id: number,
  body: string,
}) {
  const new_reply_model = await RecipeCommentReplies.create({
    comment_id: createObj.comment_id,
    owner_id: createObj.owner_id,
    body: createObj.body,
  });
  const reply = await get_reply_by_id(new_reply_model.get('id'));
  return reply;
}

export async function update_reply(
  updatesObj: {
    body: string,
  },
  id: number
) {
  const updates = await RecipeCommentReplies.update({
    body: updatesObj.body,
  }, { where: { id } });
  return updates;
}

export async function delete_reply(id: number) {
  const deletes = await RecipeCommentReplies.destroy({ where: { id } });
  return deletes;
}