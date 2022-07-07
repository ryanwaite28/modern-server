import { cities_map } from "../_common/assets/cities";
import { countries_by_name_map } from "../_common/assets/countries";
import { states_map } from "../_common/assets/states";
import { zipcodes_map } from "../_common/assets/zipcodes";
import {
  optional_numberValidator,
  optional_textValidator,
  optional_phoneValidator,
  optional_emailValidator,
  required_numberValidator,
  required_textValidator,
  required_booleanValidator,
  optional_booleanValidator,
  dateObjValidator,
  getUserFullName,
} from "../_common/common.chamber";
import { IModelValidator, INotification, IUser, PlainObject} from "../_common/interfaces/common.interface";
import { IMyModel } from "../_common/models/common.model-types";
import { get_user_by_id } from "../_common/repos/users.repo";
  


// export enum AUTO_SERVICES {
//   // STANDARD
//   DIAGNOSTICS = 'DIAGNOSTICS',
//   OIL_CHANGE = 'OIL_CHANGE',
//   FRONT_BREAKS = 'FRONT_BREAKS',
//   REAR_BREAKS = 'REAR_BREAKS',
//   ALL_TIRES = 'ALL_TIRES',
//   ONE_TIRE = 'ONE_TIRE',
//   TWO_TIRES = 'TWO_TIRES',
//   THREE_TIRES = 'THREE_TIRES',
//   AIR_CONDITIONING = 'AIR_CONDITIONING',
//   COOLANT = 'COOLANT',
//   ANTIFREEZE = 'ANTIFREEZE',
//   ANTILOCK_BREAK_SYSTEM = ''
//   CHASSIS_SUSPENSION,
//   COMPUTER_DIAGNOSTICS,
//   FILTERS,
//   SHOCKS_STRUTS,
//   SUSPENSION_STEERING,
//   TRIP_INSPECTION,
//   TUNE_UP,
//   WINDSHIELD,

//   // ENGINE
//   BELT,
//   COOLING_SYSTEM,
//   DRIVABILITY_DIAGNOSTICS,
//   ENGINE,
//   ENGINE_PERFORMANCE,
//   FUEL_INJECTION,
//   HOSE,
//   IGNITION_SYSTEM,
//   TRANSMISSION,
//   RADIATOR,
//   WATER_PUMP,

//   // EXHAUST


//   // HEATING & AC


//   // AUTO ELECTRICAL


//   // TRANSMISSION


//   // FLEET


//   // TIRE


//   OTHER = 'OTHER',
// }

export enum AUTO_SERVICE_ACTION_TYPES {
  MAINTENANCE = 'MAINTENANCE',
  FIX = 'FIX',
  REPAIR = 'REPAIR',
  REPLACE = 'REPLACE',
  REMOVE = 'REMOVE',
  INSTALL = 'INSTALL',
  INSPECT = 'INSPECT',
  OTHER = 'OTHER',
}

export const service_action_types = Object.keys(AUTO_SERVICE_ACTION_TYPES);

export const standard_services = [
  `30/60/90/120 Mile Services`,
  `Brake Repair & Antilock Braking System Repair`,
  `Chassis & Suspension Repair`,
  `Check Engine Light Diagnostics & Repair`,
  `Computer Diagnostics`,
  `Factory Scheduled Maintenance`,
  `Filter Replacements`,
  `Fluid Services`,
  `Maintenance Inspections`,
  `Oil Changes`,
  `Shocks & Struts Repair`,
  `Suspension & Steering Repair`,
  `Trip Inspections`,
  `Tune Ups`,
  `Windshield Wiper Blades`,
];

export const engine_services = [
  `Belt Replacement`,
  `Cooling System Repair`,
  `Drivability Diagnostics & Repair`,
  `Engine Repair`,
  `Engine Replacement`,
  `Engine Performance Check`,
  `Fuel Injection Repair & Service`,
  `Fuel System Repair & Maintenance`,
  `Hose Replacement`,
  `Ignition System Repair & Maintenance`,
  `Radiator Repair & Replacement`,
  `Water Pump Repair & Replacement`,
];

export const exhaust_services = [
  `Catalytic Converter Repair`,
  `Exhaust Repair & Replacement`,
  `Exhaust Manifold Repair`,
  `Muffler Repair & Replacement`,
  `Tailpipe Repair & Replacement`,
];

export const heating_ac_services = [
  `Belt Repair & Replacement`,
  `Compressor Repair & Replacement`,
  `Evaporator Repair & Replacement`,
  `Heating & Cooling System Diagnostics`,
  `Heating System Repair & Service`,
  `Refrigerant Replacement`,
];

export const auto_electrical_services = [
  `Alternator Repair & Replacement`,
  `Electrical System Diagnostics & Repair`,
  `Power Antenna Repair`,
  `Check Engine Light Diagnostics & Repair`,
  `Light Repair & Bulb Replacements`,
  `Power Accessory Repair`,
  `Power Lock Repair`,
  `Power Steering Repair`,
  `Power Window Repair`,
  `Windshield Wiper Repair`,
];

export const transmission_services = [
  `Axle Repair & Replacement`,
  `Clutch Repair & Replacement`,
  `Differential Diagnosis`,
  `Differential Rebuild & Service`,
  `Driveline Repair & Maintenance`,
  `Driveshaft & U-Joint Repair`,
  `Flywheel Repair & Replacement`,
  `Transmission Fluid Service`,
  `Transmission Flush`,
  `Transmission Repair & Service`,
  `Transmission Replacement`,
];

export const fleet_services = [
  `Factory Scheduled Maintenance`,
  `Preventative Maintenance`,
  `Pre-Purchase Inspections`,
  `Fleet Accounts`,
];

export const tire_services = [
  `Tire Balancing`,
  `Tire Installations`,
  `Tire Replacement`,
  `Tire Rotation`,
  `Wheel Alignment`,
];


export const all_services = [
  ...standard_services,
  ...engine_services,
  ...exhaust_services,
  ...heating_ac_services,
  ...auto_electrical_services,
  ...transmission_services,
  ...fleet_services,
  ...tire_services,
];

export const service_categories = [
  { display: 'Standard Services', key: 'standard_services' },
  { display: 'Engine Services', key: 'engine_services' },
  { display: 'Exhaust services', key: 'exhaust_services' },
  { display: 'Heating AC Services', key: 'heating_ac_services' },
  { display: 'Auto Electrical Services', key: 'auto_electrical_services' },
  { display: 'Transmission Services', key: 'transmission_services' },
  { display: 'Fleet Services', key: 'fleet_services' },
  { display: 'Tire Services', key: 'tire_services' },
];

export const service_categories_display_by_key = service_categories.reduce((obj, service) => {
  obj[service.key] = service.display;
  return obj;
}, {} as PlainObject);

export const service_types_by_service_category = Object.freeze({
  standard_services,
  engine_services,
  exhaust_services,
  heating_ac_services,
  auto_electrical_services,
  transmission_services,
  fleet_services,
  tire_services,
});

export const all_service_categories_map = service_categories.reduce((obj, service) => {
  obj[service.key] = true;
  return obj;
}, {} as PlainObject);

export const all_service_types_map = all_services.reduce((obj, service: string) => {
  obj[service] = true;
  return obj;
}, {} as PlainObject);

export const mechanic_service_actions_validator = (arg: any) => !!arg && typeof(arg) === 'string' && arg.split(',').every(i => (i in AUTO_SERVICE_ACTION_TYPES));
export const ratingOptions = Array(5).fill(0).map((k, i) => i + 1);




export const update_mechanic_fields = [
  'bio',
  'website',
  'phone',
  'email',
  'city',
  'state',
  'lat',
  'lng',
  'zipcode',
  'country',
];



export const create_mechanic_required_props: IModelValidator[] = [
  { field: 'user_id', name: 'User ID', validator: optional_numberValidator },
  { field: 'website', name: 'Website', validator: optional_textValidator },
  { field: 'phone', name: 'Phone', validator: optional_phoneValidator },
  { field: 'email', name: 'Email', validator: optional_emailValidator },
  { field: 'city', name: 'City', validator: (arg: any) => arg === '' || cities_map.has(arg) },
  { field: 'state', name: 'State', validator: (arg: any) => arg === '' || states_map.has(arg) },
  { field: 'zipcode', name: 'Zip', validator: (arg: any) => arg === 0 || zipcodes_map.has(arg) },
  { field: 'country', name: 'Country', validator: (arg: any) => arg === '' || countries_by_name_map.has(arg) },
];
export const update_mechanic_required_props: IModelValidator[] = [
  { field: 'website', name: 'Website', validator: optional_textValidator },
  { field: 'phone', name: 'Phone', validator: optional_phoneValidator },
  { field: 'email', name: 'Email', validator: optional_emailValidator },
  { field: 'city', name: 'Bio', validator: (arg: any) => arg === '' || cities_map.has(arg) },
  { field: 'state', name: 'Bio', validator: (arg: any) => arg === '' || states_map.has(arg) },
  { field: 'zipcode', name: 'Bio', validator: (arg: any) => arg === 0 || zipcodes_map.has(arg) },
  { field: 'country', name: 'Bio', validator: (arg: any) => arg === '' || countries_by_name_map.has(arg) },
];


export const create_mechanic_field_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'Mechanic ID', validator: required_numberValidator },
  { field: 'fieldname', name: 'Field Name', validator: required_textValidator },
  { field: 'fieldvalue', name: 'Field Value', validator: required_textValidator },
];
export const update_mechanic_field_required_props: IModelValidator[] = [
  { field: 'fieldname', name: 'Field Name', validator: required_textValidator },
  { field: 'fieldvalue', name: 'Field Value', validator: required_textValidator },
];


export const create_mechanic_credential_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'User ID', validator: required_numberValidator },
  { field: 'title', name: 'Title', validator: required_textValidator },
  { field: 'description', name: 'Description', validator: required_textValidator },
  // { field: 'image_link', name: 'Image Link', validator: optional_textValidator, defaultValue: '' },
  // { field: 'image_id', name: 'Image ID', validator: optional_textValidator, defaultValue: '' },
  { field: 'website', name: 'Website', validator: optional_textValidator },
];
export const update_mechanic_credential_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'User ID', validator: required_numberValidator },
  { field: 'title', name: 'Title', validator: required_textValidator },
  { field: 'description', name: 'Description', validator: required_textValidator },
  // { field: 'image_link', name: 'Image Link', validator: optional_textValidator, defaultValue: '' },
  // { field: 'image_id', name: 'Image ID', validator: optional_textValidator, defaultValue: '' },
  { field: 'website', name: 'Website', validator: optional_textValidator },
];

export const create_mechanic_credential_reporting_required_props: IModelValidator[] = [
  // { field: 'user_id', name: 'User ID', validator: required_numberValidator },
  // { field: 'credential_id', name: 'Credential ID', validator: required_numberValidator },
  { field: 'issue', name: 'Issue', validator: required_textValidator },
];
export const update_mechanic_credential_reporting_required_props: IModelValidator[] = [
  { field: 'issue', name: 'Issue', validator: required_textValidator },
];

export const create_mechanic_credential_reporting_message_required_props: IModelValidator[] = [
  // { field: 'user_id', name: 'User ID', validator: required_numberValidator },
  // { field: 'reporting_id', name: 'Reporting ID', validator: required_numberValidator },
  { field: 'body', name: 'Body', validator: required_textValidator },
];
export const update_mechanic_credential_reporting_message_required_props: IModelValidator[] = [
  { field: 'body', name: 'Body', validator: optional_textValidator },
  { field: 'opened', name: 'Issue', validator: required_booleanValidator },
];

export const create_mechanic_rating_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'Mechanic ID', validator: required_numberValidator },
  { field: 'writer_id', name: 'Writer ID', validator: required_numberValidator },
  { field: 'rating', name: 'Rating', validator: (arg: any) => ratingOptions.includes(arg) },
  { field: 'title', name: 'Title', validator: optional_textValidator },
  { field: 'summary', name: 'Summary', validator: optional_textValidator },
];
export const update_mechanic_rating_required_props: IModelValidator[] = [
  { field: 'rating', name: 'Rating', validator: required_numberValidator },
  { field: 'title', name: 'Title', validator: optional_textValidator },
  { field: 'summary', name: 'Summary', validator: optional_textValidator },
];
export const create_mechanic_rating_edit_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'Mechanic ID', validator: required_numberValidator },
  // { field: 'rating_id', name: 'Rating ID', validator: required_numberValidator },
  // { field: 'rating', name: 'Rating', validator: required_numberValidator },
  // { field: 'title', name: 'Title', validator: optional_textValidator },
  { field: 'summary', name: 'Summary', validator: required_textValidator },
];

export const create_mechanic_expertise_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'Mechanic ID', validator: required_numberValidator },
  // { field: 'credential_id', name: 'Credential ID', validator: optional_numberValidator },
  { field: 'make', name: 'Make', validator: required_textValidator },
  { field: 'model', name: 'Model', validator: required_textValidator },
  { field: 'type', name: 'Type', validator: optional_textValidator },
  { field: 'trim', name: 'Trim', validator: optional_textValidator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  { field: 'min_year', name: 'Min Year', validator: required_numberValidator },
  { field: 'max_year', name: 'Max Year', validator: required_numberValidator },
];
export const update_mechanic_expertise_required_props: IModelValidator[] = [
  // { field: 'credential_id', name: 'Credential ID', validator: optional_numberValidator },
  { field: 'make', name: 'Make', validator: required_textValidator },
  { field: 'model', name: 'Model', validator: required_textValidator },
  { field: 'type', name: 'Title', validator: optional_textValidator },
  { field: 'trim', name: 'Trim', validator: optional_textValidator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  { field: 'min_year', name: 'Min Year', validator: required_numberValidator },
  { field: 'max_year', name: 'Max Year', validator: required_numberValidator },
];

export const create_mechanic_service_required_props: IModelValidator[] = [
  // { field: 'mechanic_id', name: 'Mechanic ID', validator: required_numberValidator },
  // { field: 'expertise_id', name: 'Expertise ID', validator: optional_numberValidator },
  { field: 'service_category', name: 'Service Category', validator: (arg: any) => (arg in all_service_categories_map) },
  { field: 'service_type', name: 'Service Type', validator: (arg: any) => (arg in all_service_types_map) },
  { field: 'service_action', name: 'Service Action', validator: mechanic_service_actions_validator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  { field: 'cost', name: 'Cost', validator: required_numberValidator },
  { field: 'deposit', name: 'Deposit', validator: optional_numberValidator },
];
export const update_mechanic_service_required_props: IModelValidator[] = [
  // { field: 'expertise_id', name: 'Expertise ID', validator: optional_numberValidator },
  { field: 'service_category', name: 'Service Category', validator: (arg: any) => (arg in all_service_categories_map) },
  { field: 'service_type', name: 'Service Type', validator: (arg: any) => (arg in all_service_types_map) },
  { field: 'service_action', name: 'Service Action', validator: mechanic_service_actions_validator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  { field: 'cost', name: 'Cost', validator: required_numberValidator },
  { field: 'deposit', name: 'Deposit', validator: optional_numberValidator },
];

export const create_mechanic_service_request_required_props: IModelValidator[] = [
  { field: 'user_id', name: 'User ID', validator: required_numberValidator },
  { field: 'payment_method_id', name: 'Payment Method ID', validator: required_textValidator },
  { field: 'title', name: 'Title', validator: optional_textValidator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  
  { field: 'service_category', name: 'Service Category', validator: (arg: any) => (arg in all_service_categories_map) },
  { field: 'service_type', name: 'Service Type', validator: (arg: any) => (arg in all_service_types_map) },
  { field: 'service_action', name: 'Service Action', validator: mechanic_service_actions_validator },

  { field: 'make', name: 'Make', validator: required_textValidator },
  { field: 'model', name: 'Model', validator: required_textValidator },
  { field: 'type', name: 'Title', validator: optional_textValidator },
  { field: 'trim', name: 'Trim', validator: optional_textValidator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  { field: 'year', name: 'Car Year', validator: required_numberValidator },

  { field: 'city', name: 'City', validator: (arg: any) => arg === '' || cities_map.has(arg) },
  { field: 'state', name: 'State', validator: (arg: any) => arg === '' || states_map.has(arg) },
  { field: 'zipcode', name: 'Zip', validator: (arg: any) => arg === 0 || zipcodes_map.has(arg) },
  { field: 'country', name: 'Country', validator: (arg: any) => arg === '' || countries_by_name_map.has(arg) },
  
  { field: 'notes', name: 'Notes', validator: optional_textValidator },
  { field: 'payout', name: 'Payout', validator: required_numberValidator },
  // { field: 'deposit_paid', name: 'Deposit Paid', validator: optional_booleanValidator },
  // { field: 'deposit_refunded', name: 'Deposit Refunded', validator: optional_booleanValidator },
  // { field: 'deposit_payment_intent_id', name: 'Deposit Payment Intent Id', validator: optional_textValidator },
  // { field: 'deposit_refund_id', name: 'Deposit Refund ID', validator: optional_textValidator },
  // { field: 'date_needed', name: 'Date Needed', validator: dateObjValidator },
  { field: 'status', name: 'Status', validator: required_textValidator },
];
export const update_mechanic_service_request_required_props: IModelValidator[] = [
  { field: 'title', name: 'Title', validator: optional_textValidator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  
  { field: 'service_category', name: 'Service Category', validator: (arg: any) => (arg in all_service_categories_map) },
  { field: 'service_type', name: 'Service Type', validator: (arg: any) => (arg in all_service_types_map) },
  { field: 'service_action', name: 'Service Action', validator: mechanic_service_actions_validator },

  { field: 'make', name: 'Make', validator: required_textValidator },
  { field: 'model', name: 'Model', validator: required_textValidator },
  { field: 'type', name: 'Title', validator: optional_textValidator },
  { field: 'trim', name: 'Trim', validator: optional_textValidator },
  { field: 'description', name: 'Description', validator: optional_textValidator },
  { field: 'year', name: 'Car Year', validator: required_numberValidator },

  { field: 'city', name: 'City', validator: (arg: any) => arg === '' || cities_map.has(arg) },
  { field: 'state', name: 'State', validator: (arg: any) => arg === '' || states_map.has(arg) },
  { field: 'zipcode', name: 'Zip', validator: (arg: any) => arg === 0 || zipcodes_map.has(arg) },
  { field: 'country', name: 'Country', validator: (arg: any) => arg === '' || countries_by_name_map.has(arg) },
  
  { field: 'notes', name: 'Notes', validator: optional_textValidator },
  { field: 'payout', name: 'Payout', validator: required_numberValidator },
  // { field: 'deposit_paid', name: 'Deposit Paid', validator: optional_booleanValidator },
  // { field: 'deposit_refunded', name: 'Deposit Refunded', validator: optional_booleanValidator },
  // { field: 'deposit_payment_intent_id', name: 'Deposit Payment Intent Id', validator: optional_textValidator },
  // { field: 'deposit_refund_id', name: 'Deposit Refund ID', validator: optional_textValidator },
  // { field: 'date_needed', name: 'Date Needed', validator: dateObjValidator },
  { field: 'status', name: 'Status', validator: required_textValidator },
];

export const create_mechanic_service_request_offer_required_props: IModelValidator[] = [
  { field: 'service_request_id', name: 'Service Request ID', validator: required_numberValidator },
  { field: 'mechanic_id', name: 'Mechanic ID', validator: required_numberValidator },
  { field: 'notes', name: 'Notes', validator: optional_textValidator },
  { field: 'status', name: 'Status', validator: required_textValidator },
];
export const update_mechanic_service_request_offer_required_props: IModelValidator[] = [
  { field: 'notes', name: 'Notes', validator: optional_textValidator },
  { field: 'status', name: 'Status', validator: required_textValidator },
];

export const create_mechanic_service_request_message_required_props: IModelValidator[] = [
  { field: 'service_request_id', name: 'Service Request ID', validator: required_numberValidator },
  { field: 'user_id', name: 'User ID', validator: required_numberValidator },
  { field: 'body', name: 'Body', validator: required_textValidator },
];
export const update_mechanic_service_request_message_required_props: IModelValidator[] = [
  { field: 'body', name: 'Body', validator: required_textValidator },
  { field: 'opened', name: 'Issue', validator: required_booleanValidator },
];

export const create_mechanic_service_request_dispute_required_props: IModelValidator[] = [
  { field: 'service_request_id', name: 'Service Request ID', validator: required_numberValidator },
  { field: 'creator_id', name: 'Creator ID', validator: required_numberValidator },
  { field: 'title', name: 'Title', validator: required_textValidator },
  { field: 'description', name: 'Description', validator: required_textValidator },
  { field: 'status', name: 'Status', validator: required_textValidator },
];
export const update_mechanic_service_request_dispute_required_props: IModelValidator[] = [
  { field: 'title', name: 'Title', validator: required_textValidator },
  { field: 'description', name: 'Description', validator: required_textValidator },
  { field: 'status', name: 'Status', validator: required_textValidator },
];

export const create_mechanic_service_request_dispute_log_required_props: IModelValidator[] = [
  { field: 'dispute_id', name: 'Dispute ID', validator: required_numberValidator },
  { field: 'creator_id', name: 'Creator ID', validator: required_numberValidator },
  { field: 'body', name: 'Body', validator: required_textValidator },
  { field: 'image_link', name: 'Image Link', validator: optional_textValidator },
  { field: 'image_id', name: 'Image ID', validator: optional_textValidator },
];
export const update_mechanic_service_request_dispute_log_required_props: IModelValidator[] = [
  { field: 'body', name: 'Body', validator: required_textValidator },
  { field: 'image_link', name: 'Image Link', validator: optional_textValidator },
  { field: 'image_id', name: 'Image ID', validator: optional_textValidator },
];





export const populate_carmaster_notification_obj = async (notification_model: IMyModel) => {
  const notificationObj = notification_model.toJSON() as INotification;
  const user_model = await get_user_by_id(notificationObj.from_id)
  const full_name = getUserFullName(<IUser> user_model!);
  let message = '';
  let mount_prop_key = '';
  let mount_value = null;

  switch (notificationObj.event) {

  }

  notificationObj.from = user_model!;
  notificationObj.message = message;
  notificationObj[mount_prop_key] = mount_value;

  return notificationObj;
};