import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import {
  NewsPosts,
  NewsPostPhotos,
  NewsPostVideos,
  NewsPostAudios
} from '../models/newspost.model';
import { getRandomModels } from '../../_common/repos/_common.repo';

export async function get_newspost_by_id(id: number, slim: boolean = false) {
  const newspost = slim 
  ? await NewsPosts.findByPk(id)
  : await NewsPosts.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: NewsPostPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }, {
        model: NewsPostVideos,
        as: 'videos',
        include: [{
          model: Videos,
          as: 'video',
        }]
      }, {
        model: NewsPostAudios,
        as: 'audios',
        include: [{
          model: Audios,
          as: 'audio',
        }]
      }]
    });
  return newspost;
}

export async function create_newspost(createObj: {
  owner_id: number;
  location: string;
  lat: number;
  lng: number;
  place_id: string;
  title: string;
  body?: string;
  link?: string;
  icon_link?: string;
  icon_id?: string;
  news_date?: Date | string;
  uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[];
}) {
  const {
    owner_id,
    location,
    lat,
    lng,
    place_id,
    title,
    body,
    link,
    icon_link,
    icon_id,
    news_date,
  } = createObj;
  const new_newspost_model = await NewsPosts.create(<any> {
    owner_id,
    location,
    lat,
    lng,
    place_id,
    title,
    body,
    link,
    icon_link,
    icon_id,
    news_date,
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
    const newspost_photo_model = await NewsPostPhotos.create({
      newspost_id: new_newspost_model.get('id'),
      photo_id: photo_model.get('id'),
    });
  }
  const newspost = await get_newspost_by_id(new_newspost_model.get('id'));
  return newspost;
}

export async function update_newspost(
  updatesObj: {
    title: string;
    body: string;
    link: string;
  },
  id: number
) {
  const updates = await NewsPosts.update(<any> updatesObj, { where: { id } });
  return updates;
}

export async function delete_newspost(id: number) {
  const deletes = await NewsPosts.destroy({ where: { id } });
  return deletes;
}

export async function get_random_newsposts(limit: number = 10) {
  return getRandomModels(
    NewsPosts,
    limit,
    [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim,
    }]
  );
}