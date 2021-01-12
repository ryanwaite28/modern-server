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
import { PostComments } from '../models/post.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../chamber';
import { PlainObject } from '../interfaces/all.interface';

export async function get_comment_by_id(id: number) {
  const comment = await PostComments.findOne({
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
  post_id: number,
  body: string,
}) {
  const new_comment_model = await PostComments.create({
    post_id: createObj.post_id,
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
  const updates = await PostComments.update({
    body: updatesObj.body,
  }, { where: { id } });
  return updates;
}

export async function delete_comment(id: number) {
  const deletes = await PostComments.destroy({ where: { id } });
  return deletes;
}