import { createModelRawRouteGuards } from "../../_common/helpers/create-model-guards.helper";
import { get_service_request_by_id } from "../repos/car-master.repo";


export const ServiceRequestRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_service_request_by_id,
  model_name: 'service_request',
  request_param_id_name: 'service_request_id',
  model_owner_field: 'user_id',
});