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
  


export enum AUTO_SERVICES {
  DIAGNOSTICS = 'DIAGNOSTICS',
  OIL_CHANGE = 'OIL_CHANGE',
  FRONT_BREAKS = 'FRONT_BREAKS',
  REAR_BREAKS = 'REAR_BREAKS',
  ALL_TIRES = 'ALL_TIRES',
  ONE_TIRE = 'ONE_TIRE',
  TWO_TIRES = 'TWO_TIRES',
  THREE_TIRES = 'THREE_TIRES',
  AIR_CONDITIONING = 'AIR_CONDITIONING',
  COOLANT = 'COOLANT',
  ANTIFREEZE = 'ANTIFREEZE',
}

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