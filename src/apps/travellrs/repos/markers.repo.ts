import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import {
  Markers,
  MarkerPhotos,
  MarkerVideos,
  MarkerAudios
} from '../models/marker.model';
import { getRandomModels } from '../../_common/repos/_common.repo';

export async function get_marker_by_id(id: number, slim: boolean = false) {
  const marker = slim 
  ? await Markers.findByPk(id)
  : await Markers.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: MarkerPhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo_marker',
        }]
      }, {
        model: MarkerVideos,
        as: 'videos',
        include: [{
          model: Videos,
          as: 'video_marker',
        }]
      }, {
        model: MarkerAudios,
        as: 'audios',
        include: [{
          model: Audios,
          as: 'audio_marker',
        }]
      }]
    });
  return marker;
}

export async function create_marker(createObj: {
  owner_id: number;
  location: string;
  lat: number;
  lng: number;
  caption: string;
  image_link?: string;
  image_id?: string;
  place_id: string;
  date_traveled?: string | Date | null;
  // uploadedPhotos?: { fileInfo: PlainObject; results: IStoreImage }[];
}) {
  const new_marker_model = await Markers.create(<any> {
    owner_id: createObj.owner_id,
    location: createObj.location,
    lat: createObj.lat,
    lng: createObj.lng,
    caption: createObj.caption,
    image_link: createObj.image_link,
    image_id: createObj.image_id,
    place_id: createObj.place_id,
    date_traveled: createObj.date_traveled,
  });
  // for (const uploadedPhoto of createObj.uploadedPhotos) {
  //   const photo_model = await Photos.create(<any> {
  //     owner_id: createObj.owner_id,
  //     caption: uploadedPhoto.fileInfo.caption || '',
  //     photo_link: uploadedPhoto.results.result!.secure_url,
  //     photo_id: uploadedPhoto.results.result!.public_id,
  //     tags: uploadedPhoto.fileInfo.tags.join(',') || '',
  //     industry: uploadedPhoto.fileInfo.industry.join(',') || '',
  //   });
  //   const marker_photo_model = await MarkerPhotos.create({
  //     marker_id: new_marker_model.get('id'),
  //     photo_id: photo_model.get('id'),
  //   });
  // }
  const marker = await get_marker_by_id(new_marker_model.get('id'));
  return marker;
}

export async function update_marker(
  updatesObj: {
    caption: string;
  },
  id: number
) {
  const updates = await Markers.update(<any> {
    caption: updatesObj.caption,
  }, { where: { id } });
  return updates;
}

export async function delete_marker(id: number) {
  const deletes = await Markers.destroy({ where: { id } });
  return deletes;
}

export async function get_random_markers(limit: number = 10) {
  return getRandomModels(
    Markers,
    limit,
    [{
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim,
    }]
  );
}