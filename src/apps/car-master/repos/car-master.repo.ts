import {
  fn,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order,
  literal,
  DestroyOptions
} from 'sequelize';
import {
  COMMON_STATUSES,
  convertModelCurry,
  convertModelsCurry,
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
  MechanicFavorites,
  MechanicFields,
  MechanicRatingEdits,
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
  IMechanicFavorite, 
  IMechanicField, 
  IMechanicRating, 
  IMechanicRatingEdit, 
  IMechanicService, 
  IMechanicServiceRequest, 
  IMechanicServiceRequestDispute, 
  IMechanicServiceRequestDisputeLog, 
  IMechanicServiceRequestMessage, 
  IMechanicServiceRequestOffer 
} from '../interfaces/car-master.interface';
import { getAll, paginateTable } from '../../_common/repos/_common.repo';
import { CARMASTER_SERVICE_REQUEST_STATUSES } from '../enums/car-master.enum';


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
    // include: mechanicCredentialsInclude,
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
      {
        model: MechanicRatingEdits,
        as: `mechanic_rating_edits`
      }
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
        as: 'service_request_offers',
        include: [
          {
            model: Users,
            as: 'user',
            attributes: user_attrs_slim
          },
        ]
      }
    ]
  },
];

export const mechanicServiceRequestOfferMasterIncludes: Includeable[] = [
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
    as: 'service_request_offers',
    include: [
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
      }
    ]
  },
  {
    model: MechanicServiceRequestMessages,
    as: 'mechanic_service_request_messages',
  }
];


// create crud fns

const mechanics_crud = create_model_crud_repo_from_model_class<IMechanic>(Mechanics);
const mechanic_favorites_crud = create_model_crud_repo_from_model_class<IMechanicFavorite>(MechanicFavorites);
const mechanic_fields_crud = create_model_crud_repo_from_model_class<IMechanicField>(MechanicFields);
const mechanic_credentials_crud = create_model_crud_repo_from_model_class<IMechanicCredential>(MechanicCredentials);
const mechanic_credential_reportings_crud = create_model_crud_repo_from_model_class<IMechanicCredentialReporting>(MechanicCredentialReportings);
const mechanic_credential_reporting_messages_crud = create_model_crud_repo_from_model_class<IMechanicCredentialReportingMessage>(MechanicCredentialReportingMessages);
const mechanic_ratings_crud = create_model_crud_repo_from_model_class<IMechanicRating>(MechanicRatings);
const mechanic_rating_edits_crud = create_model_crud_repo_from_model_class<IMechanicRatingEdit>(MechanicRatingEdits);
const mechanic_expertises_crud = create_model_crud_repo_from_model_class<IMechanicExpertise>(MechanicExpertises);
const mechanic_services_crud = create_model_crud_repo_from_model_class<IMechanicService>(MechanicServices);
const mechanic_service_requests_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequest>(MechanicServiceRequests);
const mechanic_service_request_offers_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestOffer>(MechanicServiceRequestOffers);
const mechanic_service_request_messages_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestMessage>(MechanicServiceRequestMessages);
const mechanic_service_request_disputes_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestDispute>(MechanicServiceRequestDisputes);
const mechanic_service_request_dispute_logs_crud = create_model_crud_repo_from_model_class<IMechanicServiceRequestDisputeLog>(MechanicServiceRequestDisputeLogs);






// mechanic 

export function get_mechanic_by_id(id: number) {
  return mechanics_crud.findById(id, { include: mechanicMasterIncludes });
}

export function get_user_from_mechanic_id(id: number) {
  return mechanics_crud.findById(id, { include: [{ model: Users, as: 'user', attributes: user_attrs_slim }] }).then((mechanic) => mechanic!.user!);
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

export function update_mechanic_profile(
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
  return mechanics_crud.updateById(mechanic_id, params)
    .then(async (results: [number, (IMechanic|null)]) => {
      const mechanic = await get_mechanic_by_id(mechanic_id);
      return [results[0], mechanic] as [number, IMechanic | null];
    });
}

export async function search_mechanics(params: {
  // expertise
  make: string,
  model: string,
  max_year: number | null,
  min_year: number | null,
  trim: string,
  type: string,

  // service
  service_category: string,
  service_type: string,
  service_action: string,
  cost?: number,

  // location
  city?: string,
  state?: string,
  country?: string,

  lat?: number,
  lng?: number,
  radius: number,
}, you_id?: number) {

  const expertise_where: any = {};
  if (params.make) {
    expertise_where.make = { [Op.like]: `%${params.make}%` };
  }
  if (params.model) {
    expertise_where.model = { [Op.like]: `%${params.model}%` };
  }
  if (params.type) {
    expertise_where.type = { [Op.like]: `%${params.type}%` };
  }
  if (params.trim) {
    expertise_where.trim = { [Op.like]: `%${params.trim}%` };
  }
  if (params.min_year) {
    expertise_where.min_year = { [Op.gte]: params.min_year || 0 };
  }
  if (params.max_year) {
    expertise_where.max_year = { [Op.lte]: params.max_year || (new Date().getFullYear()) };
  }

  const service_where: any = {};
  if (params.service_category) {
    expertise_where.service_category = { [Op.like]: `%${params.service_category}%` };
  }
  if (params.service_type) {
    expertise_where.service_type = { [Op.like]: `%${params.service_type}%` };
  }
  if (params.service_action) {
    expertise_where.service_action = { [Op.like]: `%${params.service_action}%` };
  }
  if (params.cost) {
    service_where.cost = { [Op.lte]: params.cost };
  }


  // let mechanic_location_include: any = [];
  // if (params.lat && params.lng && params.radius) {
  //   mechanic_location_include = [literal("3958 * acos(cos(radians("+params.lat+")) * cos(radians(lat)) * cos(radians("+params.lng+") - radians(lng)) + sin(radians("+params.lat+")) * sin(radians(lat)))"), 'distance']
  // }
  const mechanic_where: any = {};
  if (params.city) {
    mechanic_where.city = { [Op.like]: `%${params.city}%` };
  }
  if (params.state) {
    mechanic_where.state = { [Op.like]: `%${params.state}%` };
  }
  if (params.country) {
    mechanic_where.country = { [Op.like]: `%${params.country}%` };
  }
  if (you_id) {
    mechanic_where.user_id = { [Op.ne]: you_id };
  }

  // console.log({ params, experise_where, service_where, mechanic_where, you_id });

  const results = await mechanics_crud.findAll({
    where: mechanic_where,
    attributes: {
      include: [
        // mechanic_location_include
      ]
    },
    include: [
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
        // include: mechanicCredentialsInclude,
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
          {
            model: MechanicRatingEdits,
            as: `mechanic_rating_edits`
          }
        ]
      },
      {
        model: MechanicExpertises,
        as: 'mechanic_expertises',
        where: expertise_where,
      },
      {
        model: MechanicServices,
        as: 'mechanic_services',
        where: service_where,
      },
      {
        model: MechanicServiceRequests,
        as: 'mechanic_service_requests',
        include: [
          {
            model: MechanicServiceRequestOffers,
            as: 'service_request_offers',
          }
        ]
      },
      {
        model: MechanicServiceRequestOffers,
        as: 'mechanic_service_request_offers',
      },
    ]
  });

  return results;
}

export async function search_service_requests(params: {
  // expertise
  make: string,
  model: string,
  max_year: number | null,
  min_year: number | null,
  trim: string,
  type: string,

  // service
  service_category: string,
  service_type: string,
  service_action: string,
  payout?: number,

  // location
  city?: string,
  state?: string,
  country?: string,

  lat?: number,
  lng?: number,
  radius: number,
}, you_id?: number) {

  const expertise_where: any = {};
  if (params.make) {
    expertise_where.make = { [Op.like]: `%${params.make}%` };
  }
  if (params.model) {
    expertise_where.model = { [Op.like]: `%${params.model}%` };
  }
  if (params.type) {
    expertise_where.type = { [Op.like]: `%${params.type}%` };
  }
  if (params.trim) {
    expertise_where.trim = { [Op.like]: `%${params.trim}%` };
  }
  const min_year = { [Op.gte]: params.min_year || 0 };
  const max_year = { [Op.lte]: params.max_year || (new Date().getFullYear()) };
  // if (params.min_year) {
  // }
  // if (params.max_year) {
  // }

  const service_where: any = {};
  if (params.service_category) {
    expertise_where.service_category = { [Op.like]: `%${params.service_category}%` };
  }
  if (params.service_type) {
    expertise_where.service_type = { [Op.like]: `%${params.service_type}%` };
  }
  if (params.service_action) {
    expertise_where.service_action = { [Op.like]: `%${params.service_action}%` };
  }
  // if (params.payout) {
  //   service_where.payout = { [Op.lte]: params.payout };
  // }


  // let mechanic_location_include: any = [];
  // if (params.lat && params.lng && params.radius) {
  //   mechanic_location_include = [literal("3958 * acos(cos(radians("+params.lat+")) * cos(radians(lat)) * cos(radians("+params.lng+") - radians(lng)) + sin(radians("+params.lat+")) * sin(radians(lat)))"), 'distance']
  // }
  const mechanic_where: any = {};
  if (params.city) {
    mechanic_where.city = { [Op.like]: `%${params.city}%` };
  }
  if (params.state) {
    mechanic_where.state = { [Op.like]: `%${params.state}%` };
  }
  if (params.country) {
    mechanic_where.country = { [Op.like]: `%${params.country}%` };
  }
  if (you_id) {
    mechanic_where.user_id = { [Op.ne]: you_id };
  }

  // console.log({ params, experise_where, service_where, mechanic_where, you_id });

  const results = await mechanic_service_requests_crud.findAll({
    where: {
      ...expertise_where,

      [Op.and]: [
        { year: min_year },
        { year: max_year },
      ],

      status: CARMASTER_SERVICE_REQUEST_STATUSES.OPEN
    },
    include: mechanicServiceRequestMasterIncludes
  });

  return results;
}




// mechanic favorites

export function get_mechanic_favorite_by_id(id: number) {
  return mechanic_favorites_crud.findById(id, { include: [{ model: Mechanics, as: 'mechanic' }] });
}

export function create_mechanic_favorite(params: {
  user_id: number,
  mechanic_id: number,
}) {
  return mechanic_favorites_crud.create(params);
}

export function delete_mechanic_favorite(favorite_id: number) {
  return mechanic_favorites_crud.deleteById(favorite_id);
}




// mechanic fields

export function get_mechanic_field_by_id(id: number) {
  return mechanic_fields_crud.findById(id);
}

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
  const fieldtype: string = typeof(params.fieldvalue);
  const is_link: boolean = URL_REGEX.test(params.fieldvalue);

  const createObj = {
    ...params,
    fieldtype,
    is_link
  };

  return mechanic_fields_crud.create(createObj);
}

export function update_mechanic_field(
  field_id: number,
  params: {
    fieldname: string,
    fieldvalue: string,
  }
) {
  const fieldtype: string = typeof(params.fieldvalue);
  const is_link: boolean = URL_REGEX.test(params.fieldvalue);

  const updatesObj: any = {
    ...params,
    fieldtype,
    is_link
  };

  return mechanic_fields_crud.updateById(field_id, updatesObj);
}

export function delete_mechanic_field(field_id: number) {
  return mechanic_fields_crud.deleteById(field_id);
}





// mechanic credentials

export function get_mechanic_credential_by_id(id: number) {
  return mechanic_credentials_crud.findById(id);
}

export function find_all_mechanic_credentials(mechanic_id: number) {
  return mechanic_credentials_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_credential(params: {
  mechanic_id: number,
  title: string,
  description: string,
  image_link?: string,
  image_id?: string,
  website?: string,
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

export function get_mechanic_credential_reporting_by_id(id: number) {
  return mechanic_credential_reportings_crud.findById(id);
}

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

export function get_mechanic_credential_reporting_message_by_id(id: number) {
  return mechanic_credential_reporting_messages_crud.findById(id);
}

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

export function get_mechanic_rating_by_id(id: number) {
  return mechanic_ratings_crud.findById(id);
}

export function find_all_mechanic_ratings(mechanic_id: number) {
  return mechanic_ratings_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_rating(params: {
  mechanic_id: number,
  writer_id: number,
  rating: number,
  title?: string,
  summary?: string,
}) {
  return mechanic_ratings_crud.create(params).then((rating: IMechanicRating) => {
    return mechanic_ratings_crud.findOne({
      where: { id: rating.id },
      include: [
        {
          model: Users,
          as: 'writer',
          attributes: user_attrs_slim
        },
        {
          model: MechanicRatingEdits,
          as: `mechanic_rating_edits`
        }
      ]
    })
  });
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




// mechanic rating edit

export function create_mechanic_rating_edit(params: {
  rating_id: number,
  summary: string,
}) {
  return mechanic_rating_edits_crud.create(params);
}





// mechanic expertises

export function get_mechanic_expertise_by_id(id: number) {
  return mechanic_expertises_crud.findById(id);
}

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

export function get_mechanic_service_by_id(id: number) {
  return mechanic_services_crud.findById(id);
}

export function find_all_mechanic_services(mechanic_id: number) {
  return mechanic_services_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service(params: {
  mechanic_id: number,
  expertise_id?: number,
  service_category: string,
  service_type: string,
  service_action: string,
  description?: string,
  cost: number,
}) {
  return mechanic_services_crud.create({
    ...params,
    cost: params.cost || 0,
  });
}

export function update_mechanic_service(
  service_id: number, 
  params: Partial<{
    expertise_id: number,
    service_category: string,
    service_type: string,
    service_action: string,
    description: string,
    cost: number,
  }>
) {
  return mechanic_services_crud.updateById(service_id, params);
}

export function delete_mechanic_service(service_id: number) {
  return mechanic_services_crud.deleteById(service_id);
}





// mechanic service requests

const convertServiceRequests = convertModelCurry<IMechanicServiceRequest>();

export function get_service_request_by_id(id: number, user_id?: number) {
  return mechanic_service_requests_crud.findById(id, { include: mechanicServiceRequestMasterIncludes });
}

export function find_all_mechanic_service_requests(mechanic_id: number) {
  return mechanic_service_requests_crud.findAll({
    where: {
      mechanic_id
    },
    include: mechanicServiceRequestMasterIncludes,
    order: [['id', 'DESC']]
  });
}

export function find_mechanic_service_requests(mechanic_id: number, service_request_id?: number) {
  const useWhere: WhereOptions = (!service_request_id
    ? { mechanic_id }
    : { mechanic_id, id: { [Op.lt]: service_request_id } }
  );

  return mechanic_service_requests_crud.findAll({
    where: useWhere,
    include: mechanicServiceRequestMasterIncludes,
    order: [['id', 'DESC']],
    limit: 5,
  });
}

export function find_all_user_service_requests(user_id: number) {
  return mechanic_service_requests_crud.findAll({
    where: {
      user_id
    },
    include: mechanicServiceRequestMasterIncludes,
    order: [['id', 'DESC']]
  });
}

export function find_user_service_requests(user_id: number, service_request_id?: number) {
  const useWhere: WhereOptions = (!service_request_id
    ? { user_id }
    : { user_id, id: { [Op.lt]: service_request_id } }
  );

  return mechanic_service_requests_crud.findAll({
    where: useWhere,
    include: mechanicServiceRequestMasterIncludes,
    order: [['id', 'DESC']],
    limit: 5,
  });
}



export function create_mechanic_service_request(params: {
  user_id: number,
  mechanic_id?: number,
  service_id?: number,
  service_needed: string,
  action_type: string,
  payment_method_id: string,
  title: string,
  description: string,
  notes: string,
  payout: number,
  status: string,
}) {
  return mechanic_service_requests_crud.create(params);
}

export function update_mechanic_service_request(
  service_request_id: number, 
  params: Partial<{
    mechanic_id: number,
    service_id: number,
    service_needed: string,
    action_type: string,
    payment_method_id: string,
    title: string,
    description: string,
    notes: string,
    payout: number,
    date_needed: Date,
    datetime_canceled: Date,
    datetime_accepted: Date,
    datetime_declined: Date,
    datetime_completed: Date,
    datetime_work_started: Date,
    datetime_work_finished: Date,
    status: string,
  }>
) {
  return mechanic_service_requests_crud.updateById(service_request_id, params);
}

export function delete_mechanic_service_request(service_request_id: number) {
  return mechanic_service_requests_crud.deleteById(service_request_id);
}





// mechanic service request offers

export function get_service_request_offer_by_id(id: number) {
  return mechanic_service_request_offers_crud.findById(id, { include: mechanicServiceRequestOfferMasterIncludes });
}

export function find_service_request_offers_by_service_request_id(find: FindOptions) {
  return mechanic_service_request_offers_crud.findAll(find);
}

export function find_service_request_offer_pending_by_service_request_id_and_mechanic_id(params: {
  service_request_id: number,
  mechanic_id: number
}) {
  return mechanic_service_request_offers_crud.findOne({
    where: { ...params, status: COMMON_STATUSES.PENDING }
  });
}

export function find_all_mechanic_service_request_offers(mechanic_id: number) {
  return mechanic_service_request_offers_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service_request_offer(params: {
  mechanic_id: number,
  service_request_user_id: number,
  service_request_id: number,
  notes: string,
  status: string,
}) {
  return mechanic_service_request_offers_crud.create(params).then(async (offer) => {
    const data = await get_service_request_offer_by_id(offer.id);
    return data!;
  });
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

export function delete_mechanic_service_request_offers(whereClause: DestroyOptions) {
  return mechanic_service_request_offers_crud.delete(whereClause);
}





// mechanic service request messages

export function get_service_request_message_by_id(id: number) {
  return mechanic_service_request_messages_crud.findById(id);
}

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

export function delete_mechanic_service_request_messages(whereClause: DestroyOptions) {
  return mechanic_service_request_messages_crud.delete(whereClause);
}





// mechanic service request disputes

export function get_service_request_dispute_by_id(id: number) {
  return mechanic_service_request_disputes_crud.findById(id);
}

export function find_service_request_dispute(find: FindOptions) {
  return mechanic_service_request_disputes_crud.findOne(find);
}

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

export function get_service_request_dispute_log_by_id(id: number) {
  return mechanic_service_request_dispute_logs_crud.findById(id);
}

export function find_all_mechanic_service_request_dispute_logs(mechanic_id: number) {
  return mechanic_service_request_dispute_logs_crud.findAll({
    where: { mechanic_id }
  });
}

export function create_mechanic_service_request_dispute_log(params: {
  dispute_id: number,
  creator_id: number,
  body: string,
  image_link?: string,
  image_id?: string,
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
