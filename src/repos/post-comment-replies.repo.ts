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
import { PostCommentReplies } from '../models/post.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../chamber';
import { PlainObject } from '../interfaces/all.interface';

export async function get_reply_by_id(id: number) {
  const reply = await PostCommentReplies.findOne({
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
  const new_reply_model = await PostCommentReplies.create({
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
  const updates = await PostCommentReplies.update({
    body: updatesObj.body,
  }, { where: { id } });
  return updates;
}

export async function delete_reply(id: number) {
  const deletes = await PostCommentReplies.destroy({ where: { id } });
  return deletes;
}