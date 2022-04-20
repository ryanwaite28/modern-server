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
  