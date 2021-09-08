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
  NewsPostComments,
  NewsPostCommentPhotos,
  NewsPostCommentVideos,
  NewsPostCommentAudios
} from '../models/newspost.model';

export async function get_newspost_comment_by_id(id: number) {
  const comment = await NewsPostComments.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }, {
      model: NewsPostCommentPhotos,
      as: 'photos',
      include: [{
        model: Photos,
        as: 'photo',
      }]
    }, {
      model: NewsPostCommentVideos,
      as: 'videos',
      include: [{
        model: Videos,
        as: 'video',
      }]
    }, {
      model: NewsPostCommentAudios,
      as: 'audios',
      include: [{
        model: Audios,
        as: 'audio',
      }]
    }]
  });
  return comment;
}

export async function create_newspost_comment(createObj: {
  owner_id: number,
  newspost_id: number,
  body: string,
}) {
  const new_comment_model = await NewsPostComments.create(<any> {
    newspost_id: createObj.newspost_id,
    owner_id: createObj.owner_id,
    body: createObj.body,
  });
  const comment = await get_newspost_comment_by_id(new_comment_model.get('id'));
  return comment;
}

export async function update_newspost_comment(
  updatesObj: {
    body: string,
  },
  id: number
) {
  const updates = await NewsPostComments.update({
    body: updatesObj.body,
  }, { where: { id } });
  return updates;
}

export async function delete_newspost_comment(id: number) {
  const deletes = await NewsPostComments.destroy({ where: { id } });
  return deletes;
}