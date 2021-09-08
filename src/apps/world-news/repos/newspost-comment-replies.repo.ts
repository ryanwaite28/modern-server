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
  NewsPostCommentReplies,
  NewsPostCommentReplyAudios,
  NewsPostCommentReplyPhotos,
  NewsPostCommentReplyVideos
} from '../models/newspost.model';

export async function get_newspost_comment_reply_by_id(id: number) {
  const reply = await NewsPostCommentReplies.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }, {
      model: NewsPostCommentReplyPhotos,
      as: 'photos',
      include: [{
        model: Photos,
        as: 'photo',
      }]
    }, {
      model: NewsPostCommentReplyVideos,
      as: 'videos',
      include: [{
        model: Videos,
        as: 'video',
      }]
    }, {
      model: NewsPostCommentReplyAudios,
      as: 'audios',
      include: [{
        model: Audios,
        as: 'audio',
      }]
    }]
  });
  return reply;
}

export async function create_newspost_comment_reply(createObj: {
  owner_id: number,
  comment_id: number,
  body: string,
}) {
  const new_reply_model = await NewsPostCommentReplies.create(<any> {
    comment_id: createObj.comment_id,
    owner_id: createObj.owner_id,
    body: createObj.body,
  });
  const reply = await get_newspost_comment_reply_by_id(new_reply_model.get('id'));
  return reply;
}

export async function update_reply(
  updatesObj: {
    body: string,
  },
  id: number
) {
  const updates = await NewsPostCommentReplies.update({
    body: updatesObj.body,
  }, { where: { id } });
  return updates;
}

export async function delete_newspost_comment_reply(id: number) {
  const deletes = await NewsPostCommentReplies.destroy({ where: { id } });
  return deletes;
}