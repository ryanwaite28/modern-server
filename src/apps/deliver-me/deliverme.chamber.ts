import { cities_map } from "../_common/assets/cities";
import { countries_by_name_map } from "../_common/assets/countries";
import { states_map } from "../_common/assets/states";
import { zipcodes_map } from "../_common/assets/zipcodes";
import {
  genericTextValidator,
  booleanValidator,
  numberValidator,
  validatePersonName,
  phoneValidator,
  validateEmail,
  getUserFullName,
  user_attrs_slim,
} from "../_common/common.chamber";
import { IModelValidator, INotification, IUser } from "../_common/interfaces/common.interface";
import { IMyModel } from "../_common/models/common.model-types";
import { Users } from "../_common/models/user.model";
import { get_user_by_id } from "../_common/repos/users.repo";
import { DELIVERME_EVENT_TYPES } from "./enums/deliverme.enum";
import { IDelivery } from "./interfaces/deliverme.interface";
import { get_delivery_by_id, get_delivery_tracking_update_by_id } from "./repos/deliveries.repo";


export const delivery_attrs_slim = [
  'id',
  'owner_id',
  'carrier_id',
  'title',
  'desc',
  'tags',
  'item_image_link',
  'item_image_id',
  '',
  '',
  '',
];

export const sizes = [
  'X-SMALL',
  'SMALL',
  'MEDIUM',
  'LARGE',
  'X-LARGE',
];

const payout_min = 3;

export const create_delivery_required_props: IModelValidator[] = [
  { field: 'title', name: 'Title', validator: genericTextValidator },
  { field: 'description', name: 'Description', validator: genericTextValidator },

  { field: 'from_location', name: 'From Location', validator: genericTextValidator },
  { field: 'from_address', name: 'From Address', validator: genericTextValidator },
  { field: 'from_street', name: 'From Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'from_city', name: 'From City', validator: (arg) => cities_map.has(arg) },
  { field: 'from_state', name: 'From State', validator: (arg) => states_map.has(arg) },
  { field: 'from_zipcode', name: 'From Zipcode', validator: (arg) => zipcodes_map.has(arg) },
  { field: 'from_country', name: 'From Country', validator: (arg) => countries_by_name_map.has(arg && arg.toLowerCase()) },
  { field: 'from_place_id', name: 'From Place ID', validator: genericTextValidator },
  { field: 'from_lat', name: 'From Latitude', validator: numberValidator },
  { field: 'from_lng', name: 'From Longitude', validator: numberValidator },
  { field: 'from_person', name: 'From Person', validator: validatePersonName },
  { field: 'from_person_phone', name: 'From Person Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  { field: 'from_person_email', name: 'From Person Email', validator: (arg: any) => arg === '' ||  validateEmail(arg) },
  { field: 'from_person_id_required', name: 'From Person ID Required', validator: booleanValidator },
  { field: 'from_person_sig_required', name: 'From Person Signature Required', validator: booleanValidator },

  { field: 'to_location', name: 'To Location', validator: genericTextValidator },
  { field: 'to_address', name: 'To Address', validator: genericTextValidator },
  { field: 'to_street', name: 'To Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'to_city', name: 'To City', validator: (arg) => cities_map.has(arg) },
  { field: 'to_state', name: 'To State', validator: (arg) => states_map.has(arg) },
  { field: 'to_zipcode', name: 'To Zipcode', validator: (arg) => zipcodes_map.has(arg) },
  { field: 'to_country', name: 'To Country', validator: (arg) => countries_by_name_map.has(arg && arg.toLowerCase()) },
  { field: 'to_place_id', name: 'To Place ID', validator: genericTextValidator },
  { field: 'to_lat', name: 'To Latitude', validator: numberValidator },
  { field: 'to_lng', name: 'To Longitude', validator: numberValidator },
  { field: 'to_person', name: 'To Person', validator: validatePersonName },
  { field: 'to_person_phone', name: 'To Person Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  { field: 'to_person_email', name: 'To Person Email', validator: (arg: any) => arg === '' ||  validateEmail(arg) },
  { field: 'to_person_id_required', name: 'To Person ID Required', validator: booleanValidator },
  { field: 'to_person_sig_required', name: 'To Person Signature Required', validator: booleanValidator },

  { field: 'size', name: 'Size', validator: (arg: any) => sizes.includes(arg) },
  { field: 'weight', name: 'Weight', validator: numberValidator },
  { field: 'distance_miles', name: 'Distance (Miles)', validator: numberValidator },
  { field: 'auto_accept_anyone', name: 'Auto-Accept Anyone', validator: booleanValidator },
  { field: 'urgent', name: 'Urgent', validator: booleanValidator },
  { field: 'payout', name: 'Payout', validator: (arg) => numberValidator(arg) && arg > payout_min },
  { field: 'penalty', name: 'Penalty', validator: numberValidator },
];

export const update_delivery_required_props: IModelValidator[] = [
  { field: 'title', name: 'Title', validator: genericTextValidator },
  { field: 'description', name: 'Description', validator: genericTextValidator },

  { field: 'from_location', name: 'From Location', validator: genericTextValidator },
  { field: 'from_address', name: 'From Address', validator: genericTextValidator },
  { field: 'from_street', name: 'From Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'from_city', name: 'From City', validator: (arg) => cities_map.has(arg) },
  { field: 'from_state', name: 'From State', validator: (arg) => states_map.has(arg) },
  { field: 'from_zipcode', name: 'From Zipcode', validator: (arg) => zipcodes_map.has(arg) },
  { field: 'from_country', name: 'From Country', validator: (arg) => countries_by_name_map.has(arg && arg.toLowerCase()) },
  { field: 'from_place_id', name: 'From Place ID', validator: genericTextValidator },
  { field: 'from_lat', name: 'From Latitude', validator: numberValidator },
  { field: 'from_lng', name: 'From Longitude', validator: numberValidator },
  { field: 'from_person', name: 'From Person', validator: validatePersonName },
  { field: 'from_person_phone', name: 'From Person Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  { field: 'from_person_email', name: 'From Person Email', validator: (arg: any) => arg === '' ||  validateEmail(arg) },
  { field: 'from_person_id_required', name: 'From Person ID Required', validator: booleanValidator },
  { field: 'from_person_sig_required', name: 'From Person Signature Required', validator: booleanValidator },

  { field: 'to_location', name: 'To Location', validator: genericTextValidator },
  { field: 'to_address', name: 'To Address', validator: genericTextValidator },
  { field: 'to_street', name: 'To Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'to_city', name: 'To City', validator: (arg) => cities_map.has(arg) },
  { field: 'to_state', name: 'To State', validator: (arg) => states_map.has(arg) },
  { field: 'to_zipcode', name: 'To Zipcode', validator: (arg) => zipcodes_map.has(arg) },
  { field: 'to_country', name: 'To Country', validator: (arg) => countries_by_name_map.has(arg && arg.toLowerCase()) },
  { field: 'to_place_id', name: 'To Place ID', validator: genericTextValidator },
  { field: 'to_lat', name: 'To Latitude', validator: numberValidator },
  { field: 'to_lng', name: 'To Longitude', validator: numberValidator },
  { field: 'to_person', name: 'To Person', validator: validatePersonName },
  { field: 'to_person_phone', name: 'To Person Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  { field: 'to_person_email', name: 'To Person Email', validator: (arg: any) => arg === '' ||  validateEmail(arg) },
  { field: 'to_person_id_required', name: 'To Person ID Required', validator: booleanValidator },
  { field: 'to_person_sig_required', name: 'To Person Signature Required', validator: booleanValidator },

  { field: 'size', name: 'Size', validator: (arg: any) => sizes.includes(arg) },
  { field: 'weight', name: 'Weight', validator: numberValidator },
  { field: 'distance_miles', name: 'Distance (Miles)', validator: numberValidator },
  { field: 'auto_accept_anyone', name: 'Auto-Accept Anyone', validator: booleanValidator },
  { field: 'urgent', name: 'Urgent', validator: booleanValidator },
  { field: 'payout', name: 'Payout', validator: (arg) => numberValidator(arg) && arg > payout_min },
  { field: 'penalty', name: 'Penalty', validator: numberValidator },
];

export const create_delivery_tracking_update_required_props: { field: string; name: string; validator: (arg: any) => boolean }[] = [
  { field: 'message', name: 'Message', validator: genericTextValidator },
  { field: 'carrier_lat', name: 'Carrier\'s Latitude', validator: numberValidator },
  { field: 'carrier_lng', name: 'Carrier\'s Longitude', validator: numberValidator },
];

export const deliveryme_user_settings_required_props: { field: string; name: string; validator: (arg: any) => boolean }[] = [
  { field: 'phone', name: 'Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  { field: 'email', name: 'Email', validator: (arg: any) => arg === '' || validateEmail(arg) },
  { field: 'cashapp_tag', name: '$CashApp Tag', validator: (arg: any) => arg === '' || genericTextValidator(arg) },
  { field: 'venmo_id', name: 'Venmo @', validator: (arg: any) => arg === '' || genericTextValidator(arg) },
  { field: 'paypal_me', name: 'Paypal.Me Link', validator: (arg: any) => arg === '' || genericTextValidator(arg) },
  { field: 'google_pay', name: 'Google Pay (name/phone/id/etc)', validator: (arg: any) => arg === '' || genericTextValidator(arg) },
];


export const populate_deliverme_notification_obj = async (notification_model: IMyModel) => {
  const notificationObj = notification_model.toJSON() as INotification;
  const user_model = await get_user_by_id(notificationObj.from_id)
  const full_name = getUserFullName(<IUser> user_model!.toJSON());
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {
    case DELIVERME_EVENT_TYPES.CARRIER_ASSIGNED: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} is now handling your delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.CARRIER_UNASSIGNED: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} canceled your delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.CARRIER_MARKED_AS_PICKED_UP: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} picked up your delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.CARRIER_MARKED_AS_DROPPED_OFF: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} dropped off your delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.DELIVERY_ADD_COMPLETED_PICTURE: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} added a picture to complete delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.DELIVERY_COMPLETED: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} completed the delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.DELIVERY_RETURNED: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} returned the delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }
    case DELIVERME_EVENT_TYPES.DELIVERY_NEW_MESSAGE: {
      const delivery: IDelivery | null = await get_delivery_by_id(notificationObj.target_id);
      message = `${full_name} added a message to the delivery: ${delivery!.title}`;
      mount_prop_key = 'delivery';
      mount_value = delivery!;
      break;
    }

    case DELIVERME_EVENT_TYPES.DELIVERY_NEW_TRACKING_UPDATE: {
      const tracking_update = await get_delivery_tracking_update_by_id(notificationObj.target_id);
      if (!tracking_update) {
        message = `${full_name} added a new tracking update to your delivery: [EXPIRED]`;
        mount_prop_key = 'delivery';
        mount_value = {};
      }
      else {
        const delivery: IDelivery | null = await get_delivery_by_id(tracking_update.delivery_id);
        message = `${full_name} added a new tracking update to your delivery: ${delivery!.title}`;
        mount_prop_key = 'delivery';
        mount_value = delivery;

        notificationObj.tracking_update = tracking_update
      }
      break;
    }
  }

  notificationObj.from = user_model!.toJSON();
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
}

export const delivery_search_attrs = [
  'id',
  'owner_id',

  'created_at',
  'size',
  'weight',
  'distance_miles',
  'payout',
  'penalty',

  'title',
  // 'description',

  'from_city',
  'from_state',
  'from_zipcode',

  'to_city',
  'to_state',
  'to_zipcode',
];