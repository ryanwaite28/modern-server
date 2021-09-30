import { cities_map } from "../_common/assets/cities";
import { countries_by_name_map } from "../_common/assets/countries";
import { states_map } from "../_common/assets/states";
import { zipcodes_map } from "../_common/assets/zipcodes";
import { genericTextValidator, numberValidator, validatePersonName, phoneValidator, validateEmail, booleanValidator, user_attrs_slim, getUserFullName } from "../_common/common.chamber";
import { IModelValidator, IUser } from "../_common/interfaces/common.interface";
import { Users } from "../_common/models/user.model";
import { MYFAVORS_EVENT_TYPES } from "./enums/myfavors.enum";
import { get_favor_by_id, get_favor_update_by_id } from "./repos/favors.repo";





const date_needed_validator = (arg: any, required: boolean = false): boolean => {
  if (!arg && !required) {
    return true;
  }
  if (!arg && required) {
    return false;
  }

  const isValid = (
    (/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/).test(arg) ||
    (/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/).test(arg) ||
    (/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).(\d{3}[a-zA-Z]Z)/).test(arg)
  );

  return isValid;
};

const payout_min = 3;

export const create_update_favor_required_props: IModelValidator[] = [
  { field: 'title', name: 'Title', validator: genericTextValidator },
  { field: 'description', name: 'Description', validator: genericTextValidator },
  { field: 'category', name: 'Category', validator: (arg: any) => arg === '' || genericTextValidator(arg) },

  { field: 'location', name: 'From Location', validator: genericTextValidator },
  { field: 'address', name: 'From Address', validator: genericTextValidator },
  { field: 'street', name: 'From Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'city', name: 'From City', validator: (arg) => cities_map.has(arg) },
  { field: 'state', name: 'From State', validator: (arg) => states_map.has(arg) },
  { field: 'zipcode', name: 'From Zipcode', validator: (arg) => zipcodes_map.has(arg) },
  { field: 'country', name: 'From Country', validator: (arg) => countries_by_name_map.has(arg && arg.toLowerCase()) },
  { field: 'place_id', name: 'From Place ID', validator: genericTextValidator },
  { field: 'lat', name: 'From Latitude', validator: numberValidator },
  { field: 'lng', name: 'From Longitude', validator: numberValidator },

  { field: 'payout_per_helper', name: 'Payout per helper', validator: (arg: any) => numberValidator(arg) && arg > payout_min },
  { field: 'helpers_wanted', name: 'Helpers needed', validator: (arg: any) => numberValidator(arg) && arg > 0 },
  { field: 'date_needed', name: 'DateTime needed', validator: (arg: any) => date_needed_validator(arg) },
];

export const create_favor_update_required_props: { field: string; name: string; validator: (arg: any) => boolean }[] = [
  { field: 'message', name: 'Message', validator: genericTextValidator },
  // { field: 'carrier_lat', name: 'Carrier\'s Latitude', validator: numberValidator },
  // { field: 'carrier_lng', name: 'Carrier\'s Longitude', validator: numberValidator },
];

export const myfavors_user_settings_required_props: { field: string; name: string; validator: (arg: any) => boolean }[] = [
  // { field: 'phone', name: 'Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  // { field: 'email', name: 'Email', validator: (arg: any) => arg === '' || validateEmail(arg) },
];



export const populate_myfavors_notification_obj = async (notification_model: any) => {
  const notificationObj = notification_model.toJSON();
  const user_model = await Users.findOne({
    where: { id: notificationObj.id },
    attributes: user_attrs_slim
  });
  const full_name = getUserFullName(<IUser> user_model!.toJSON());
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {
    case MYFAVORS_EVENT_TYPES.FAVOR_NEW_MESSAGE: {
      const favor_model = await get_favor_by_id(notificationObj.target_id);
      message = `${full_name} added a message to the favor: ${favor_model!.get('title')}`;
      mount_prop_key = 'favor';
      mount_value = favor_model!.toJSON();
      break;
    }

    case MYFAVORS_EVENT_TYPES.FAVOR_NEW_UPDATE: {
      const favor_update_model = await get_favor_update_by_id(notificationObj.target_id);
      if (!favor_update_model) {
        message = `${full_name} added a new update to your favor: [EXPIRED]`;
        mount_prop_key = 'favor';
        mount_value = {};
      }
      else {
        const favor_model = await get_favor_by_id(favor_update_model!.get('favor_id') as number);
        message = `${full_name} added a new update to your favor: ${favor_model!.get('title')}`;
        mount_prop_key = 'favor';
        mount_value = favor_model!.toJSON();

        notificationObj.favor_update = favor_update_model!.toJSON();
      }
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}

// export const favor_search_attrs = [
//   'id',
//   'owner_id',

//   'created_at',
//   'size',
//   'weight',
//   'distance_miles',
//   'payout',
//   'penalty',

//   'title',
//   // 'description',

//   'city',
//   'state',
//   'zipcode',

//   'to_city',
//   'to_state',
//   'to_zipcode',
// ];