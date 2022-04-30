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
  stripeValidators,
} from "../_common/common.chamber";
import { IModelValidator, INotification, IUser } from "../_common/interfaces/common.interface";
import { IMyModel } from "../_common/models/common.model-types";
import { Users } from "../_common/models/user.model";
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

export const all_services_map = {
  standard_services,
  engine_services,
  exhaust_services,
  heating_ac_services,
  auto_electrical_services,
  transmission_services,
  fleet_services,
  tire_services,
};



export const create_mechanic_required_props: IModelValidator[] = [
  { field: 'user_id', name: 'User ID', validator: numberValidator },
  { field: 'website', name: 'Website', validator: (arg: any) => arg === '' || genericTextValidator(arg) },
  { field: 'phone', name: 'Phone', validator: (arg: any) => arg === '' || phoneValidator(arg) },
  { field: 'email', name: 'Email', validator: (arg: any) => arg === '' || validateEmail(arg) },
  { field: 'city', name: 'Bio', validator: (arg: any) => arg === '' || cities_map.has(arg) },
  { field: 'state', name: 'Bio', validator: (arg: any) => arg === '' || states_map.has(arg) },
  { field: 'zipcode', name: 'Bio', validator: (arg: any) => arg === 0 || zipcodes_map.has(arg) },
  { field: 'country', name: 'Bio', validator: (arg: any) => arg === '' || countries_by_name_map.has(arg) },
];