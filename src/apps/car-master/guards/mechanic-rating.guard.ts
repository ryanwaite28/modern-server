import { createModelRawRouteGuards } from "../../_common/helpers/create-model-guards.helper";
import { get_mechanic_rating_by_id } from "../repos/car-master.repo";


export const MechanicRatingRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_mechanic_rating_by_id,
  model_name: 'mechanic_rating',
  request_param_id_name: 'rating_id',
  model_owner_field: 'writer_id',
  response_locals_model_owner: `mechanic_model`,
});