// app route guards

import { createModelRouteGuards } from "../../_common/helpers/create-model-guards.helper";

export const FetchRouteGuards = createModelRouteGuards({
  get_model_fn: get_fetch_by_id,
  model_name: 'marker',
  model_owner_field: 'owner_id',
  request_param_id_name: 'marker_id',
});