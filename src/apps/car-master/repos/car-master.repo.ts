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
  create_model_crud_repo_from_model_class,
  URL_REGEX,
  user_attrs_slim
} from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import {
  MechanicCredentialReportingMessages,
  MechanicCredentialReportings,
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
import {
  IMechanic,
  IMechanicCredential, 
  IMechanicCredentialReporting, 
  IMechanicCredentialReportingMessage, 
  IMechanicExpertise, 
  IMechanicField, 
  IMechanicRating, 
  IMechanicService, 
  IMechanicServiceRequest, 
  IMechanicServiceRequestDispute, 
  IMechanicServiceRequestDisputeLog, 
  IMechanicServiceRequestMessage, 
  IMechanicServiceRequestOffer 
} from '../interfaces/car-master.interface';


export const mechanicCredentialsInclude: Includeable[] = [
  {
    model: MechanicCredentialReportings,
    as: 'mechanic_credential_reportings',
    include: [
      {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      },
      {
        model: MechanicCredentialReportingMessages,
        as: 'mechanic_credential_reporting_messages',
        include: [
          {
            model: Users,
            as: 'user',
            attributes: user_attrs_slim
          },
        ]
      }
    ]
  }
];

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
    include: mechanicCredentialsInclude,
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
    include: [
      {
        model: MechanicServiceRequestOffers,
        as: 'mechanic_service_request_offers',
      }
    ]
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
    include: [
      {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      },
    ]
  },
  {
    model: MechanicServices,
    as: 'service',
  },
  {
    model: MechanicServiceRequestOffers,
    as: 'mechanic_service_request_offers',
  }
];


// create crud fns

const mechanics_crud = create_model_crud_repo_from_model_class<IMechanic>(Mechanics);
const mechanic_fields_crud = create_model_crud_repo_from_model_class<IMechanicField>(MechanicFields);
const mechanic_credentials_crud = create_model_crud_repo_from_model_class<IMechanicCredential>(MechanicCredentials);
const mechanic_credential_reportings_crud = create_model_crud_repo_from_model_class<IMechanicCredentialReporting>(MechanicCredentialReportings);
const mechanic_credential_reporting_messages_crud = create_model_crud_repo_from_model_class<IMechanicCredentialReportingMessage>(MechanicCredentialReportingMessages);
const mechanic_ratings_crud = create_model_crud_repo_from_model_class<IMechanicRating>(MechanicRatings);
const mechanic_expertises_crud = create_model_crud_repo_from_model_class<IMechanicExpertise>(MechanicExpertises);
const mechanic_services_crud = create_model_crud_repo_from_model_class<IMechanicService>(MechanicServices);
const mechanic_service_requests_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequest>(MechanicServiceRequests);
const mechanic_service_request_offers_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestOffer>(MechanicServiceRequestOffers);
const mechanic_service_request_messages_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestMessage>(MechanicServiceRequestMessages);
const mechanic_service_request_disputes_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestDispute>(MechanicServiceRequestDisputes);
const mechanic_service_request_dispute_logs_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestDisputeLog>(MechanicServiceRequestDisputeLogs);






// mechanic 

export function get_mechanic_by_id(mechanic_id: number) {
  return mechanics_crud.findOne({
    where: { id: mechanic_id },
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

export function update_mechanic(
  mechanic_id: number,
  params: Partial<{
    bio: string,
    website: string,
    phone: string,
    email: string,
    city: string,
    state: string,
    zipcode: number,
    country: string,
  }>
) {
  return mechanics_crud.updateById(mechanic_id, params);
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

export function update_mechanic_field(
  field_id: number, 
  params: {
    fieldname: string,
    fieldvalue: string,
  }
) {
  const fieldtype = typeof(params.fieldvalue);
  const is_link = URL_REGEX.test(params.fieldvalue);

  return mechanic_fields_crud.updateById(field_id, {
    ...params,
    fieldtype,
    is_link
  });
}

export function delete_mechanic_field(field_id: number) {
  return mechanic_fields_crud.deleteById(field_id);
}





// mechanic credentials

export function find_all_mechanic_credentials(mechanic_id: number) {
  return mechanic_credentials_crud.findAll({
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

export function update_mechanic_credential(
  credential_id: number, 
  params: Partial<{
    title: string,
    description: string,
    image_link: string,
    image_id: string,
    website: string,
  }>
) {
  return mechanic_credentials_crud.updateById(credential_id, params);
}

export function delete_mechanic_credential(credential_id: number) {
  return mechanic_credentials_crud.deleteById(credential_id);
}





// mechanic credential reportings

export function find_all_mechanic_credential_reportings(credential_id: number) {
  return mechanic_credential_reportings_crud.findAll({
    where: { credential_id }
  });
}

export function create_mechanic_credential_reporting(params: {
  user_id: number,
  credential_id: number,
  issue: string,
}) {
  return mechanic_credential_reportings_crud.create(params);
}

export function update_mechanic_credential_reporting(
  reporting_id: number,
  params: Partial<{
    issue: string,
  }>
) {
  return mechanic_credential_reportings_crud.updateById(reporting_id, params);
}

export function delete_mechanic_credential_reporting(reporting_id: number) {
  return mechanic_credential_reportings_crud.deleteById(reporting_id);
}





// mechanic credential reporting messages

export function find_all_mechanic_credential_reporting_messages(reporting_id: number) {
  return mechanic_credential_reporting_messages_crud.findAll({
    where: { reporting_id }
  });
}

export function create_mechanic_credential_reporting_message(params: {
  reporting_id: number,
  user_id: number,
  body: string,
}) {
  return mechanic_credential_reporting_messages_crud.create(params);
}

export function update_mechanic_credential_reporting_message(
  message_id: number, 
  params: Partial<{
    body: string,
    opened: boolean,
  }>
) {
  return mechanic_credential_reporting_messages_crud.updateById(message_id, params);
}

export function delete_mechanic_credential_reporting_message(message_id: number) {
  return mechanic_credential_reporting_messages_crud.deleteById(message_id);
}





// mechanic ratings

export function find_all_mechanic_ratings(mechanic_id: number) {
  return mechanic_ratings_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_rating(params: {
  mechanic_id: number,
  writer_id: number,
  rating: number,
  title: string,
  summary: string,
}) {
  return mechanic_ratings_crud.create(params);
}

export function update_mechanic_rating(
  rating_id: number, 
  params: Partial<{
    rating: number,
    title: string,
    summary: string,
  }>
) {
  return mechanic_ratings_crud.updateById(rating_id, params);
}

export function delete_mechanic_rating(rating_id: number) {
  return mechanic_ratings_crud.deleteById(rating_id);
}





// mechanic expertises

export function find_all_mechanic_expertises(mechanic_id: number) {
  return mechanic_expertises_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_expertise(params: {
  mechanic_id: number,
  credential_id?: number,
  make: string,
  model: string,
  type?: string,
  trim?: string,
  description?: string,
  min_year: number,
  max_year: number,
}) {
  return mechanic_expertises_crud.create(params);
}

export function update_mechanic_expertise(
  expertise_id: number, 
  params: Partial<{
    credential_id: number,
    make: string,
    model: string,
    type: string,
    trim: string,
    description: string,
    min_year: number,
    max_year: number,
  }>
) {
  return mechanic_expertises_crud.updateById(expertise_id, params);
}

export function delete_mechanic_expertise(expertise_id: number) {
  return mechanic_expertises_crud.deleteById(expertise_id);
}





// mechanic services

export function find_all_mechanic_services(mechanic_id: number) {
  return mechanic_services_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service(params: {
  mechanic_id: number,
  expertise_id?: number,
  service: string,
  actions: string,
  description?: string,
  cost: number,
  deposit: number,
}) {
  return mechanic_services_crud.create(params);
}

export function update_mechanic_service(
  service_id: number, 
  params: Partial<{
    expertise_id: number,
    service: string,
    actions: string,
    description: string,
    cost: number,
    deposit: number,
  }>
) {
  return mechanic_services_crud.updateById(service_id, params);
}

export function delete_mechanic_service(service_id: number) {
  return mechanic_services_crud.deleteById(service_id);
}





// mechanic service requests

export function get_service_request_by_id(id: number) {
  return mechanic_service_requests_crud.findOne({
    where: { id },
    include: mechanicServiceRequestMasterIncludes,
  });
}

export function find_all_mechanic_service_requests(mechanic_id: number) {
  return mechanic_service_requests_crud.findAll({
    where: { mechanic_id }
  });
}

export function find_all_user_service_requests(user_id: number) {
  return mechanic_service_requests_crud.findAll({
    where: { user_id }
  });
}

export function create_mechanic_service_request(params: {
  user_id: number,
  mechanic_id?: number,
  expertise_id?: number,
  service_needed: string,
  action_type: string,
  payment_method_id: string,
  title: string,
  description: string,
  notes: string,
  payout: number,
  deposit_paid?: boolean,
  date_needed: Date,
  status: string,
}) {
  return mechanic_service_requests_crud.create(params);
}

export function update_mechanic_service_request(
  service_request_id: number, 
  params: Partial<{
    mechanic_id: number,
    expertise_id: number,
    service_needed: string,
    action_type: string,
    payment_method_id: string,
    title: string,
    description: string,
    notes: string,
    payout: number,
    deposit_paid: boolean,
    date_needed: Date,
    datetime_canceled: Date,
    datetime_accepted: Date,
    datetime_declined: Date,
    datetime_completed: Date,
    status: string,
  }>
) {
  return mechanic_service_requests_crud.updateById(service_request_id, params);
}

export function delete_mechanic_service_request(service_request_id: number) {
  return mechanic_service_requests_crud.deleteById(service_request_id);
}





// mechanic service request offers

export function find_all_mechanic_service_request_offers(mechanic_id: number) {
  return mechanic_service_request_offers_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service_request_offer(params: {
  mechanic_id: number,
  service_request_id: number,
  notes: string,
  status: string,
}) {
  return mechanic_service_request_offers_crud.create(params);
}

export function update_mechanic_service_request_offer(
  service_request_offer_id: number, 
  params: Partial<{
    notes: string,
    status: string,
  }>
) {
  return mechanic_service_request_offers_crud.updateById(service_request_offer_id, params);
}

export function delete_mechanic_service_request_offer(service_request_offer_id: number) {
  return mechanic_service_request_offers_crud.deleteById(service_request_offer_id);
}





// mechanic service request messages

export function find_all_mechanic_service_request_messages(mechanic_id: number) {
  return mechanic_service_request_messages_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service_request_message(params: {
  service_request_id: number,
  user_id: number,
  body: string,
}) {
  return mechanic_service_request_messages_crud.create(params);
}

export function update_mechanic_service_request_message(
  service_request_message_id: number, 
  params: Partial<{
    body: string,
    opened: string,
  }>
) {
  return mechanic_service_request_messages_crud.updateById(service_request_message_id, params);
}

export function delete_mechanic_service_request_message(service_request_message_id: number) {
  return mechanic_service_request_messages_crud.deleteById(service_request_message_id);
}





// mechanic service request disputes

export function find_all_mechanic_service_request_disputes(mechanic_id: number) {
  return mechanic_service_request_disputes_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service_request_dispute(params: {
  service_request_id: number,
  creator_id: number,
  title: string,
  description: string,
  status: string,
}) {
  return mechanic_service_request_disputes_crud.create(params);
}

export function update_mechanic_service_request_dispute(
  service_request_dispute_id: number, 
  params: Partial<{
    title: string,
    description: string,
    status: string,
  }>
) {
  return mechanic_service_request_disputes_crud.updateById(service_request_dispute_id, params);
}

export function delete_mechanic_service_request_dispute(service_request_dispute_id: number) {
  return mechanic_service_request_disputes_crud.deleteById(service_request_dispute_id);
}





// mechanic service request dispute_logs

export function find_all_mechanic_service_request_dispute_logs(mechanic_id: number) {
  return mechanic_service_request_dispute_logs_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service_request_dispute_log(params: {
  dispute_id: number,
  creator_id: number,
  body: string,
  image_link: string,
  image_id: string,
}) {
  return mechanic_service_request_dispute_logs_crud.create(params);
}

export function update_mechanic_service_request_dispute_log(
  service_request_dispute_log_id: number, 
  params: Partial<{
    body: string,
    image_link: string,
    image_id: string,
  }>
) {
  return mechanic_service_request_dispute_logs_crud.updateById(service_request_dispute_log_id, params);
}

export function delete_mechanic_service_request_dispute_log(service_request_dispute_log_id: number) {
  return mechanic_service_request_dispute_logs_crud.deleteById(service_request_dispute_log_id);
}
