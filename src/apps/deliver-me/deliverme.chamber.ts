import { cities_map } from "../_common/assets/cities";
import { states_map } from "../_common/assets/states";
import { zipcodes_map } from "../_common/assets/zipcodes";
import { genericTextValidator } from "../_common/common.chamber";


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

export const create_delivery_required_props: { field: string; name: string; validator: (arg: any) => boolean }[] = [
  { field: 'title', name: 'Title', validator: genericTextValidator },
  { field: 'description', name: 'Description', validator: genericTextValidator },

  { field: 'from_street', name: 'From Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'from_city', name: 'From City', validator: (arg) => cities_map.has(arg) },
  { field: 'from_state', name: 'From State', validator: (arg) => states_map.has(arg) },
  { field: 'from_zipcode', name: 'From Zipcode', validator: (arg) => zipcodes_map.has(arg) },

  { field: 'to_street', name: 'To Street', validator: (arg) => (/^[a-zA-Z0-9\s]+$/).test(arg) },
  { field: 'to_city', name: 'To City', validator: (arg) => cities_map.has(arg) },
  { field: 'to_state', name: 'To State', validator: (arg) => states_map.has(arg) },
  { field: 'to_zipcode', name: 'To Zipcode', validator: (arg) => zipcodes_map.has(arg) },

  { field: 'category', name: 'Category', validator: genericTextValidator },
  { field: 'size', name: 'Size', validator: (arg) => (/^[\d]+$/).test(arg) },
  { field: 'weight', name: 'Weight', validator: (arg) => (/^[\d]+$/).test(arg) },
  { field: 'auto_accept_anyone', name: 'Auto Accept', validator: (arg) => typeof(arg) === 'boolean' },
  { field: 'urgent', name: 'Urgent', validator: (arg) => typeof(arg) === 'boolean' },
  { field: 'payout', name: 'Payout', validator: (arg) => (/^[\d]+$/).test(arg) },
  { field: 'penalty', name: 'Penalty', validator: (arg) => (/^[\d]+$/).test(arg) },
];
