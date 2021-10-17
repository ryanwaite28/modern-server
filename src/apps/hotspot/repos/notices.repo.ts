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
import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Users } from '../../_common/models/user.model';
import { Notices, NoticePhotos } from '../models/notice.model';

export async function get_notice_by_id(id: number, slim: boolean = false) {
  const notice = slim 
  ? await Notices.findByPk(id)
  : await Notices.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }, {
        model: NoticePhotos,
        as: 'photos',
        include: [{
          model: Photos,
          as: 'photo',
        }]
      }]
    });
  return notice;
}

export async function create_notice(createObj: {
  owner_id: number;

  parent_id: number; // this notice is a reply to nother
  quote_id: number; // posting notice with your own caption
  share_id: number; // posting notice without caption

  body: string;
  tags: string[];
  visibility: string;
  is_explicit: boolean;
  is_private: boolean;
  uploadedPhotos: { fileInfo: PlainObject; results: IStoreImage }[];
}) {
  const new_notice_model = await Notices.create({
    owner_id: createObj.owner_id,
    parent_id: createObj.parent_id,
    quote_id: createObj.quote_id,
    share_id: createObj.share_id,
    visibility: createObj.visibility || '',
    is_explicit: createObj.is_explicit,
    is_private: createObj.is_private,
    body: createObj.body,
    tags: createObj.tags.join(`,`),
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
    const notice_photo_model = await NoticePhotos.create({
      notice_id: new_notice_model.get('id'),
      photo_id: photo_model.get('id'),
    });
  }
  const notice = await get_notice_by_id(new_notice_model.get('id'));
  return notice;
}

// export async function update_notice(
//   updatesObj: {
//     body: string;
//     tags: string[];
//     industry: string[];
//   },
//   id: number
// ) {
//   const updates = await Notices.update({
//     body: updatesObj.body,
//     tags: updatesObj.tags.join(`,`),
//     industry: updatesObj.industry.join(`,`),
//   }, { where: { id } });
//   return updates;
// }

export async function delete_notice(id: number) {
  const deletes = await Notices.destroy({ where: { id } });
  return deletes;
}