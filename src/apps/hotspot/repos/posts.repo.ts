import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import {
  Posts,
  PostPhotos,
  PostVideos,
  PostAudios
} from '../models/post.model';

export async function get_post_by_id(id: number, slim: boolean = false) {
  const post = slim 
  ? await Posts.findByPk(id)
  : await Posts.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: PostPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }, {
        model: PostVideos,
        as: 'videos',
        include: [{
          model: Videos,
          as: 'video',
        }]
      }, {
        model: PostAudios,
        as: 'audios',
        include: [{
          model: Audios,
          as: 'audio',
        }]
      }]
    });
  return post;
}

export async function create_post(createObj: {
  owner_id: number;
  body: string;
  tags: string[];
  industry: string[];
  uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[];
}) {
  const new_post_model = await Posts.create(<any> {
    owner_id: createObj.owner_id,
    body: createObj.body,
    tags: createObj.tags.join(`,`),
    industry: createObj.industry.join(`,`),
  });
  for (const uploadedPhoto of createObj.uploadedPhotos) {
    const photo_model = await Photos.create(<any> {
      owner_id: createObj.owner_id,
      caption: uploadedPhoto.fileInfo.caption || '',
      photo_link: uploadedPhoto.results.result!.secure_url,
      photo_id: uploadedPhoto.results.result!.public_id,
      tags: uploadedPhoto.fileInfo.tags.join(',') || '',
      industry: uploadedPhoto.fileInfo.industry.join(',') || '',
    });
    const post_photo_model = await PostPhotos.create({
      post_id: new_post_model.get('id'),
      photo_id: photo_model.get('id'),
    });
  }
  const post = await get_post_by_id(new_post_model.get('id'));
  return post;
}

export async function update_post(
  updatesObj: {
    body: string;
    tags: string[];
    industry: string[];
  },
  id: number
) {
  const updates = await Posts.update(<any> {
    body: updatesObj.body,
    tags: updatesObj.tags.join(`,`),
    industry: updatesObj.industry.join(`,`),
  }, { where: { id } });
  return updates;
}

export async function delete_post(id: number) {
  const deletes = await Posts.destroy({ where: { id } });
  return deletes;
}