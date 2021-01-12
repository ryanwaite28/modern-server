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
import { IStoreImage } from '../cloudinary-manager';
import { user_attrs_slim } from '../chamber';
import { PlainObject } from '../interfaces/all.interface';
import { Photos } from '../models/photo.model';
import { Posts, PostPhotos } from '../models/post.model';
import { Users } from '../models/user.model';

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
  const new_post_model = await Posts.create({
    owner_id: createObj.owner_id,
    body: createObj.body,
    tags: createObj.tags.join(`,`),
    industry: createObj.industry.join(`,`),
  });
  for (const uploadedPhoto of createObj.uploadedPhotos) {
    const photo_model = await Photos.create({
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
  const updates = await Posts.update({
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