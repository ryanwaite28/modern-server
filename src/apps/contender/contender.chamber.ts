import { genericTextValidator, getUserFullName, user_attrs_slim } from "../_common/common.chamber";
import { IUser } from "../_common/interfaces/common.interface";
import { Users } from "../_common/models/user.model";
import { CONTENDER_EVENT_TYPES } from "./enums/contender.enum";
import { get_interview_by_id } from "./repos/interviews.repo";



export const deliveryme_user_settings_required_props: { field: string; name: string; validator: (arg: any) => boolean }[] = [
  { field: '', name: '', validator: (arg: any) => arg === '' || genericTextValidator(arg) },
];


export const populate_contender_notification_obj = async (notification_model: any) => {
  const notificationObj = notification_model.toJSON();
  const user_model = await Users.findOne({
    where: { id: notificationObj.from_id },
    attributes: user_attrs_slim
  });
  const full_name = getUserFullName(<IUser> user_model!.toJSON());
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {
    case CONTENDER_EVENT_TYPES.NEW_INTERVIEW_COMMENT: {
      const interview_model = await get_interview_by_id(notificationObj.target_id);
      message = `${full_name} commented on your interview: ${interview_model?.get('title') || '[EXPIRED]'}`;
      mount_prop_key = 'delivery';
      mount_value = interview_model?.toJSON();
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}