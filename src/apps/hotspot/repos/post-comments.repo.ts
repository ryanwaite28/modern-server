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
import { PostCommentAudios, PostCommentPhotos, PostComments, PostCommentVideos } from '../models/post.model';

export async function get_comment_by_id(id: number) {
  const comment = await PostComments.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim
    }, {
      model: PostCommentPhotos,
      as: 'photos',
      include: [{
        model: Photos,
        as: 'photo',
      }]
    }, {
      model: PostCommentVideos,
      as: 'videos',
      include: [{
        model: Videos,
        as: 'video',
      }]
    }, {
      model: PostCommentAudios,
      as: 'audios',
      include: [{
        model: Audios,
        as: 'audio',
      }]
    }]
  });
  return comment;
}

export async function create_comment(createObj: {
  owner_id: number,
  post_id: number,
  body: string,
}) {
  const new_comment_model = await PostComments.create(<any> {
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