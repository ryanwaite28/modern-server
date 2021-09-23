import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import { ContenderSeminars } from '../models/seminars.model';



export async function get_seminar_by_id(id: number, slim: boolean = false) {
  const seminar = slim 
  ? await ContenderSeminars.findByPk(id)
  : await ContenderSeminars.findOne({
      where: { id },
      include: []
    });
  return seminar;
}

export async function create_seminar(createObj: {
  
}) {
  const new_seminar_model = await ContenderSeminars.create(<any> {
    
  });



  const seminar = await get_seminar_by_id(new_seminar_model.get('id'))!;
  return seminar;
}

export async function update_seminar(id: number, updateObj: {
  
}) {
  const updates = await ContenderSeminars.update(<any> {
    
  }, { where: { id } });
  return updates;
}

export async function delete_seminar(id: number) {
  const deletes = await ContenderSeminars.destroy({ where: { id } });
  return deletes;
}
