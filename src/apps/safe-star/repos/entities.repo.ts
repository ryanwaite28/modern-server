import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import { Entities } from "../models/entity.model";


export async function get_entity_by_id(id: number, slim: boolean = false) {
  const entity = slim 
  ? await Entities.findByPk(id)
  : await Entities.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    });
  return entity;
}

export async function create_entity(createObj: {

}) {
  const new_entity_model = await Entities.create(<any> {
    
  });



  const post = await get_entity_by_id(new_entity_model.get('id'));
  return post;
}

export async function update_entity(id: number, updateObj: {
  
}) {
  const updates = await Entities.update(<any> {
    
  }, { where: { id } });
  return updates;
}

export async function delete_entity(id: number) {
  const deletes = await Entities.destroy({ where: { id } });
  return deletes;
}