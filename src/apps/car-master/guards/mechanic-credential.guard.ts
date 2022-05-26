import { createModelRawRouteGuards } from "../../_common/helpers/create-model-guards.helper";
import { get_mechanic_credential_by_id } from "../repos/car-master.repo";


export const MechanicCredentialRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_mechanic_credential_by_id,
  model_name: 'mechanic_credential',
  request_param_id_name: 'credential_id',
  model_owner_field: 'mechanic_id',
  response_locals_model_owner: `mechanic_model`,
});