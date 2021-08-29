import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import { Delivery } from '../models/delivery.model';
import { ICreateDeliveryProps } from '../interfaces/deliverme.interface';



export async function get_delivery_by_id(id: number, slim: boolean = false) {
  const delivery = !slim 
  ? await Delivery.findByPk(id)
  : await Delivery.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    });
  return delivery;
}

export async function create_delivery(createObj: ICreateDeliveryProps) {
  const new_delivery_model = await Delivery.create(<any> createObj);
  const post = await get_delivery_by_id(new_delivery_model.get('id'));
  return post;
}

export async function update_delivery(id: number, updateObj: Partial<ICreateDeliveryProps>) {
  const updates = await Delivery.update(<any> updateObj, { where: { id } });
  return updates;
}

export async function delete_delivery(id: number) {
  const deletes = await Delivery.destroy({ where: { id } });
  return deletes;
}