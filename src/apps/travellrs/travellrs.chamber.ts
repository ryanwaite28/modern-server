import { user_attrs_slim, getUserFullName, genericTextValidator, numberValidator } from "../_common/common.chamber";
import { IModelValidator, IUser } from "../_common/interfaces/common.interface";
import { Users } from "../_common/models/user.model";
import { TRAVELLRS_EVENT_TYPES } from "./enums/travellrs.enum";
import { get_marker_by_id } from "./repos/markers.repo";




export const create_marker_required_props: IModelValidator[] = [
  { field: `location`, name: `Location`, validator: genericTextValidator },
  { field: `lat`, name: `Latitude`, validator: numberValidator },
  { field: `lng`, name: `Longitude`, validator: numberValidator },
  { field: `place_id`, name: `Place ID`, validator: genericTextValidator },
];

export const populate_travellrs_notification_obj = async (notification_model: any) => {
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
    case TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT: {
      const marker_model = await get_marker_by_id(notificationObj.target_id, true);
      message = `${full_name} commented on your marker: ${marker_model!.get('title')}`;
      mount_prop_key = 'marker';
      mount_value = marker_model!.toJSON();
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}