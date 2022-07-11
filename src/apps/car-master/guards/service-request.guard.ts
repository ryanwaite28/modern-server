import { createModelRawRouteGuards } from "../../_common/helpers/create-model-guards.helper";
import { get_service_request_by_id, get_service_request_offer_by_id } from "../repos/car-master.repo";


export const ServiceRequestUserRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_service_request_by_id,
  model_name: 'service_request',
  request_param_id_name: 'service_request_id',
  model_owner_field: 'user_id',
});

export const ServiceRequestMechanicRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_service_request_by_id,
  model_name: 'service_request',
  request_param_id_name: 'service_request_id',
  model_owner_field: 'mechanic_id',
});



export const ServiceRequestOfferUserRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_service_request_offer_by_id,
  model_name: 'service_request_offer',
  request_param_id_name: 'service_request_offer_id',
  model_owner_field: 'service_request_user_id',
});

export const ServiceRequestOfferMechanicRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_service_request_offer_by_id,
  model_name: 'service_request_offer',
  request_param_id_name: 'service_request_offer_id',
  model_owner_field: 'mechanic_id',
});