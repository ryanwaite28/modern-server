import { ICommonModel, IUser } from "src/apps/_common/interfaces/common.interface";



export interface IMechanic extends ICommonModel {
  id: number,
  user_id: number,
  bio: string,
  website: string,
  phone: string,
  email: string,
  city: string,
  state: string,
  zipcode: number,
  country: string,
  date_created: string,
  uuid: string,

  user?: IUser,
  mechanic_fields?: IMechanicField[],
  mechanic_credentials?: IMechanicCredential[],
  mechanic_ratings?: IMechanicRating[],
  mechanic_expertises?: IMechanicExpertise[],
  mechanic_services?: IMechanicService[],
  mechanic_service_requests?: IMechanicServiceRequest[],
  mechanic_offers?: IMechanicServiceRequestOffer[],
}

export interface IMechanicField extends ICommonModel {
  id: number,
  mechanic_id: number,
  fieldname: string,
  fieldtype: string,
  fieldvalue: string,
  is_link: boolean,
  
  date_created: string,
  uuid: string,

  mechanic?: IMechanic,
}

export interface IMechanicCredential extends ICommonModel {
  id: number,
  mechanic_id: number,
  title: string,
  description: string,
  image_link: string,
  image_id: string,
  website: string,
  
  date_created: string,
  uuid: string,

  mechanic?: IMechanic,
}

export interface IMechanicRating extends ICommonModel {
  id: number,
  writer_id: number,
  mechanic_id: number,
  rating: number,
  title: string,
  summary: string,
  
  date_created: string,
  uuid: string,

  writer?: IUser,
  mechanic?: IMechanic,
}

export interface IMechanicExpertise extends ICommonModel {
  id: number,
  mechanic_id: number,
  credential_id: number,
  make: string,
  model: string,
  type: string,
  trim: string,
  description: string,
  min_year: number,
  max_year: number,
  
  date_created: string,
  uuid: string,

  credential?: IMechanicCredential,
  mechanic?: IMechanic,
}

export interface IMechanicService extends ICommonModel {
  id: number,
  mechanic_id: number,
  expertise_id: number,
  service: string,
  description: string,
  cost: number,
  deposit: number,
  
  date_created: string,
  uuid: string,

  mechanic?: IMechanic,
  expertise?: IMechanicExpertise,
}

export interface IMechanicServiceRequest extends ICommonModel {
  id: number,
  user_id: number,
  mechanic_id: number,
  service_id: number,
  payment_method_id: string,
  
  title: string,
  description: string,
  notes: string,
  deposit_paid: boolean,

  datetime_needed: string,
  datetime_canceled: string,
  datetime_accepted: string,
  datetime_declined: string,
  datetime_completed: string,
  status: string,
  
  date_created: string,
  uuid: string,

  user?: IUser,
  mechanic?: IMechanic,
  service?: IMechanicService,
  mechanic_service_request_offers?: IMechanicServiceRequestOffer[];
}

export interface IMechanicServiceRequestOffer {
  id: number,
  service_request_id: number,
  mechanic_id: number,
  notes: string,
  status: string,
  
  date_created: string,
  uuid: string,
}

export interface IMechanicServiceRequestMessage extends ICommonModel {
  id: number,
  service_request_id: number,
  user_id: number,
  body: string,
  opened: boolean,
  date_created: string,
  uuid: string,

  user?: IUser,
  service_request?: IMechanicServiceRequest,
}

export interface IMechanicServiceDispute extends ICommonModel {
  id: number,
  creator_id: number,
  service_request_id: number,
  title: string,
  description: string,
  status: string,
  date_created: string,
  uuid: string,

  creator?: IUser,
  service_request?: IMechanicServiceRequest,
}

export interface IMechanicServiceDisputeLog extends ICommonModel {
  id: number,
  creator_id: number,
  dispute_id: number,
  body: string,
  image_link: string,
  image_id: string,
  date_created: string,
  uuid: string,

  creator?: IUser,
  dispute?: IMechanicServiceDispute,
}