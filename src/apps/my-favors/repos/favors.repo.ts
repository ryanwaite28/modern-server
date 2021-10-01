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
  FavorUpdates,
  FavorHelpers,
  FavorMessages,
} from '../models/favor.model';
import { getRandomModels } from '../../_common/repos/_common.repo';
import { ICreateFavorUpdateProps, ICreateUpdateFavor } from '../interfaces/myfavors.interface';
import { Includeable } from 'sequelize/types';




export const favorMasterIncludes: Includeable[] = [
  {
    model: Users,
    as: 'owner',
    attributes: user_attrs_slim,
  },
  {
    model: FavorHelpers,
    as: 'favor_helpers',
    include: [{
      model: Users,
      as: 'helper',
      attributes: user_attrs_slim,
    }]
  },
  {
    model: FavorUpdates,
    as: 'favor_updates',
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      // order: [['id', 'DESC']]
    }]
  }, 
  {
    model: FavorMessages,
    as: 'favor_messages',
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
      // order: [['id', 'DESC']]
    }]
  }, 
  {
    model: FavorPhotos,
    as: 'favor_photos',
    include: [{
      model: Photos,
      as: 'favor_photo',
    }]
  }, 
  {
    model: FavorVideos,
    as: 'favor_videos',
    include: [{
      model: Videos,
      as: 'favor_video',
    }]
  }
]

export async function get_favor_by_id(id: number, slim: boolean = false) {
  const favor = slim 
  ? await Favors.findByPk(id)
  : await Favors.findOne({
      where: { id },
      include: favorMasterIncludes
    });
  return favor;
}

export async function create_favor(createObj: ICreateUpdateFavor) {
  const {
    owner_id,

    title,
    description,
    category,

    item_image_link,
    item_image_id,
    featured,
    
    location,
    address,
    street,
    city,
    state,
    zipcode,
    country,
    place_id,
    lat,
    lng,

    payout_per_helper,
    helpers_wanted,
    date_needed,
  } = createObj;

  const new_favor_model = await Favors.create(<any> {
    owner_id,

    title,
    description,
    category,
    item_image_link,
    item_image_id,
    featured,
    
    location,
    address,
    street,
    city,
    state,
    zipcode,
    country,
    place_id,
    lat,
    lng,

    payout_per_helper,
    helpers_wanted,
    date_needed,
  });

  if (createObj.uploadedPhotos) {
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
  }

  console.log(`--- new favor model created/inserted ---`);
  
  const favor = await get_favor_by_id(new_favor_model.get('id'));
  return favor!;
}

export async function update_favor(
  updatesObj: Partial<ICreateUpdateFavor>,
  id: number
) {
  const {
    owner_id,

    title,
    description,
    category,
    item_image_link,
    item_image_id,
    featured,
    
    location,
    address,
    street,
    city,
    state,
    zipcode,
    country,
    place_id,
    lat,
    lng,

    payout_per_helper,
    helpers_wanted,
    payment_session_id,
    date_needed,
  } = updatesObj;
  const updates = await Favors.update(<any> {
    owner_id,

    title,
    description,
    category,
    item_image_link,
    item_image_id,
    featured,
    
    location,
    address,
    street,
    city,
    state,
    zipcode,
    country,
    place_id,
    lat,
    lng,

    payout_per_helper,
    helpers_wanted,
    payment_session_id,
    date_needed,
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
    favorMasterIncludes
  );
}

export async function get_favor_updates(favor_id: number) {
  const favor_update = await FavorUpdates.findAll({
    where: { favor_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
    }]
  });
  return favor_update;
}

export async function get_favor_update_by_id(id: number) {
  const favor_update = await FavorUpdates.findOne({
    where: { id, deleted_at: null },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
    }]
  });
  return favor_update;
}

export async function create_favor_update(createObj: ICreateFavorUpdateProps) {
  const new_favor_update_model = await FavorUpdates.create(<any> createObj);
  const id = new_favor_update_model.get('id') as number;
  const update = await FavorUpdates.findOne({
    where: { id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim,
    }]
  });
  return update!;
}