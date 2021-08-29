import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import {
  Favors,
  FavorPhotos,
  FavorVideos,
} from '../models/favor.model';
import { getRandomModels } from '../../_common/repos/_common.repo';

export async function get_favor_by_id(id: number, slim: boolean = false) {
  const favor = slim 
  ? await Favors.findByPk(id)
  : await Favors.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: FavorPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }, {
        model: FavorVideos,
        as: 'videos',
        include: [{
          model: Videos,
          as: 'video',
        }]
      }]
    });
  return favor;
}

export async function create_favor(createObj: {
  owner_id: number,
  title: string,
  desc: string,
  location: string,
  category: string,
  payout: number,
  helpers_needed: number,
  date_needed: Date | string,
  uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[];
}) {
  const {
    owner_id,
    title,
    desc,
    location,
    category,
    payout,
    helpers_needed,
    date_needed,
  } = createObj;
  const new_favor_model = await Favors.create(<any> {
    owner_id,
    title,
    desc,
    location,
    category,
    payout,
    helpers_needed,
    date_needed,
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
    const favor_photo_model = await FavorPhotos.create({
      favor_id: new_favor_model.get('id'),
      photo_id: photo_model.get('id'),
    });
  }
  const favor = await get_favor_by_id(new_favor_model.get('id'));
  return favor;
}

export async function update_favor(
  updatesObj: {
    caption: string;
  },
  id: number
) {
  const updates = await Favors.update(<any> {
    caption: updatesObj.caption,
  }, { where: { id } });
  return updates;
}

export async function delete_favor(id: number) {
  const deletes = await Favors.destroy({ where: { id } });
  return deletes;
}

export async function get_random_favors(limit: number = 10) {
  return getRandomModels(
    Favors,
    limit,
    [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim,
    }]
  );
}