import {
  fn,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order
} from 'sequelize';
import {
  COMMON_STATUSES,
  convertModel,
  convertModelCurry,
  convertModels,
  convertModelsCurry,
  create_model_crud_repo_from_model_class,
  URL_REGEX,
  user_attrs_slim
} from '../../_common/common.chamber';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { IMyModel } from '../../_common/models/common.model-types';
import Bluebird from 'bluebird';
import {
  MechanicCredentials,
  MechanicExpertises,
  MechanicFields,
  MechanicRatings,
  Mechanics,
  MechanicServiceRequestOffers,
  MechanicServiceRequests,
  MechanicServices
} from '../models/car-master.model';
import { IMechanic, IMechanicField, IMechanicServiceRequest } from '../interfaces/car-master.interface';



export const mechanicMasterIncludes: Includeable[] = [
  {
    model: Users,
    as: 'user',
    attributes: user_attrs_slim
  },
  {
    model: MechanicFields,
    as: 'mechanic_fields',
  },
  {
    model: MechanicCredentials,
    as: 'mechanic_credentials',
  },
  {
    model: MechanicRatings,
    as: 'mechanic_ratings',
    include: [
      {
        model: Users,
        as: 'writer',
        attributes: user_attrs_slim
      },
    ]
  },
  {
    model: MechanicExpertises,
    as: 'mechanic_expertises',
  },
  {
    model: MechanicServices,
    as: 'mechanic_services',
  },
  {
    model: MechanicServiceRequests,
    as: 'mechanic_service_requests',
  },
  {
    model: MechanicServiceRequestOffers,
    as: 'mechanic_offers',
  },
];

export const mechanicServiceRequestMasterIncludes: Includeable[] = [
  {
    model: Users,
    as: 'user',
    attributes: user_attrs_slim
  },
  {
    model: Mechanics,
    as: 'mechanic',
  },
  {
    model: MechanicServices,
    as: 'service',
  },
  {
    model: MechanicServices,
    as: 'service',
  },
];







export function get_mechanic_by_id(id: number) {
  return Mechanics.findOne({
    where: { id },
    include: mechanicMasterIncludes,
  })
  .then(convertModelCurry<IMechanic>());
}

export function get_mechanic_by_user_id(user_id: number) {
  return Mechanics.findOne({
    where: { user_id },
    include: mechanicMasterIncludes,
  })
  .then(convertModelCurry<IMechanic>());
}

export function create_mechanic_from_user_id(user_id: number) {
  return Mechanics.create({
    user_id,
    bio: ``,
    website: ``,
    phone: ``,
    email: ``,
    city: ``,
    state: ``,
    zipcode: 0,
    country: ``,
  })
  .then((model) => {
    const converted = convertModelCurry<IMechanic>()(model);
    return converted!;
  });
}



// mechanic fields
export const mechanic_fields_crud = create_model_crud_repo_from_model_class<IMechanicField>(MechanicFields);

export function create_mechanic_field(params: {
  mechanic_id: number,
  fieldname: string,
  fieldvalue: string,
}) {
  const fieldtype = typeof(params.fieldvalue);
  const is_link = URL_REGEX.test(params.fieldvalue);

  return mechanic_fields_crud.create({
    ...params,
    fieldtype,
    is_link
  });
}


export function get_service_request_by_id(id: number) {
  return MechanicServiceRequests.findOne({
    where: { id },
    include: mechanicServiceRequestMasterIncludes,
  })
  .then(convertModelCurry<IMechanicServiceRequest>());
}

