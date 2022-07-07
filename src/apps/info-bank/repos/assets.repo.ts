import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import { Assets } from "../models/asset.model";


export async function get_asset_by_id(id: number, slim: boolean = false) {
  const asset = slim 
  ? await Assets.findByPk(id)
  : await Assets.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    });
  return asset;
}

export async function create_asset(createObj: {

}) {
  const new_asset_model = await Assets.create(<any> {
    
  });



  const post = await get_asset_by_id(new_asset_model.get('id'));
  return post;
}

export async function update_asset(id: number, updateObj: {
  
}) {
  const updates = await Assets.update(<any> {
    
  }, { where: { id } });
  return updates;
}

export async function delete_asset(id: number) {
  const deletes = await Assets.destroy({ where: { id } });
  return deletes;
}