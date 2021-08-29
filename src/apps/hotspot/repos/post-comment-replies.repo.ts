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
import { Audios } from '../../_common/models/audio.model';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { user_attrs_slim } from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import {
  PostCommentReplies,
  PostCommentReplyAudios,
  PostCommentReplyPhotos,
  PostCommentReplyVideos
} from '../models/post.model';

export async function get_reply_by_id(id: number) {
  const reply = await PostCommentReplies.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }, {
      model: PostCommentReplyPhotos,
      as: 'photos',
      include: [{
        model: Photos,
        as: 'photo',
      }]
    }, {
      model: PostCommentReplyVideos,
      as: 'videos',
      include: [{
        model: Videos,
        as: 'video',
      }]
    }, {
      model: PostCommentReplyAudios,
      as: 'audios',
      include: [{
        model: Audios,
        as: 'audio',
      }]
    }]
  });
  return reply;
}

export async function create_reply(createObj: {
  owner_id: number,
  comment_id: number,
  body: string,
}) {
  const new_reply_model = await PostCommentReplies.create(<any> {
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