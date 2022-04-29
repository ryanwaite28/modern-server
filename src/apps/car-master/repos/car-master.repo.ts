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
  convertModelCurry,
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
  MechanicServiceRequestDisputeLogs,
  MechanicServiceRequestDisputes,
  MechanicServiceRequestMessages,
  MechanicServiceRequestOffers,
  MechanicServiceRequests,
  MechanicServices
} from '../models/car-master.model';
import { IMechanic, IMechanicExpertise, IMechanicField, IMechanicRating, IMechanicService, IMechanicServiceRequest, IMechanicServiceRequestDispute, IMechanicServiceRequestDisputeLog, IMechanicServiceRequestMessage, IMechanicServiceRequestOffer } from '../interfaces/car-master.interface';



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


// create crud fns

const mechanics_crud = create_model_crud_repo_from_model_class<IMechanic>(Mechanics);
const mechanic_fields_crud = create_model_crud_repo_from_model_class<IMechanicField>(MechanicFields);
const mechanic_credentials_crud = create_model_crud_repo_from_model_class<IMechanicField>(MechanicCredentials);
const mechanic_ratings_crud = create_model_crud_repo_from_model_class<IMechanicRating>(MechanicRatings);
const mechanic_expertises_crud = create_model_crud_repo_from_model_class<IMechanicExpertise>(MechanicExpertises)
const mechanic_services_crud = create_model_crud_repo_from_model_class<IMechanicService>(MechanicServices)
const mechanic_service_requests_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequest>(MechanicServiceRequests)
const mechanic_service_request_offers_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestOffer>(MechanicServiceRequestOffers)
const mechanic_service_request_messages_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestMessage>(MechanicServiceRequestMessages)
const mechanic_service_request_disputes_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestDispute>(MechanicServiceRequestDisputes)
const mechanic_service_request_dispute_logs_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestDisputeLog>(MechanicServiceRequestDisputeLogs)






// mechanic 

export function get_mechanic_by_id(id: number) {
  return mechanics_crud.findOne({
    where: { id },
    include: mechanicMasterIncludes,
  });
}

export function get_mechanic_by_user_id(user_id: number) {
  return mechanics_crud.findOne({
    where: { user_id },
    include: mechanicMasterIncludes,
  });
}

export function create_mechanic_from_user_id(user_id: number) {
  return mechanics_crud.create({
    user_id,
    bio: ``,
    website: ``,
    phone: ``,
    email: ``,
    city: ``,
    state: ``,
    zipcode: 0,
    country: ``,
  });
}

export function update_mechanic(id: number, params: {
  bio: string,
  website: string,
  phone: string,
  email: string,
  city: string,
  state: string,
  zipcode: number,
  country: string,
}) {
  return mechanics_crud.updateOne(id, params);
}



// mechanic fields

export function find_all_mechanic_fields(mechanic_id: number) {
  return mechanic_fields_crud.findAll({
    where: { mechanic_id }
  });
}

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

export function update_mechanic_field(id: number, params: {
  fieldname: string,
  fieldvalue: string,
}) {
  const fieldtype = typeof(params.fieldvalue);
  const is_link = URL_REGEX.test(params.fieldvalue);

  return mechanic_fields_crud.updateOne(id, {
    ...params,
    fieldtype,
    is_link
  });
}

export function delete_mechanic_field(id: number) {
  return mechanic_fields_crud.deleteById(id);
}



// mechanic credentials

export function find_all_mechanic_credentials(mechanic_id: number) {
  return mechanic_fields_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_credential(params: {
  mechanic_id: number,
  title: string,
  description: string,
  image_link: string,
  image_id: string,
  website: string,
}) {
  return mechanic_credentials_crud.create(params);
}

export function update_mechanic_credential(id: number, params: {
  title: string,
  description: string,
  image_link: string,
  image_id: string,
  website: string,
}) {
  return mechanic_credentials_crud.updateOne(id, params);
}

export function delete_mechanic_credential(id: number) {
  return mechanic_credentials_crud.deleteById(id);
}














































export function get_service_request_by_id(id: number) {
  return MechanicServiceRequests.findOne({
    where: { id },
    include: mechanicServiceRequestMasterIncludes,
  })
  .then(convertModelCurry<IMechanicServiceRequest>());
}

