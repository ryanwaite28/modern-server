import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
// import {
//   Listings,
//   ListingPhotos,
//   ListingVideos,
// } from '../models/listing.model';

// export async function get_listing_by_id(id: number, slim: boolean = false) {
//   const listing = slim 
//   ? await Listings.findByPk(id)
//   : await Listings.findOne({
//       where: { id },
//       include: [{
//         model: Users,
//         as: 'owner',
//         attributes: user_attrs_slim
//       }, {
//         model: ListingPhotos,
//         as: 'photos',
//         include: [{
//           model: Photos,
//           as: 'photo',
//         }]
//       }, {
//         model: ListingVideos,
//         as: 'videos',
//         include: [{
//           model: Videos,
//           as: 'video',
//         }]
//       }]
//     });
//   return listing;
// }

// export async function create_listing(createObj: {
//   owner_id: number;
//   body: string;
//   tags: string[];
//   industry: string[];
//   uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[];
// }) {
//   const new_listing_model = await Listings.create(<any> {
//     owner_id: createObj.owner_id,
//     body: createObj.body,
//     tags: createObj.tags.join(`,`),
//     industry: createObj.industry.join(`,`),
//   });
//   for (const uploadedPhoto of createObj.uploadedPhotos) {
//     const photo_model = await Photos.create(<any> {
//       owner_id: createObj.owner_id,
//       caption: uploadedPhoto.fileInfo.caption || '',
//       photo_link: uploadedPhoto.results.result!.secure_url,
//       photo_id: uploadedPhoto.results.result!.public_id,
//       tags: uploadedPhoto.fileInfo.tags.join(',') || '',
//       industry: uploadedPhoto.fileInfo.industry.join(',') || '',
//     });
//     const listing_photo_model = await ListingPhotos.create({
//       listing_id: new_listing_model.get('id'),
//       photo_id: photo_model.get('id'),
//     });
//   }
//   const listing = await get_listing_by_id(new_listing_model.get('id'));
//   return listing;
// }

// export async function update_listing(
//   updatesObj: {
//     body: string;
//     tags: string[];
//     industry: string[];
//   },
//   id: number
// ) {
//   const updates = await Listings.update(<any> {
//     body: updatesObj.body,
//     tags: updatesObj.tags.join(`,`),
//     industry: updatesObj.industry.join(`,`),
//   }, { where: { id } });
//   return updates;
// }

// export async function delete_listing(id: number) {
//   const deletes = await Listings.destroy({ where: { id } });
//   return deletes;
// }