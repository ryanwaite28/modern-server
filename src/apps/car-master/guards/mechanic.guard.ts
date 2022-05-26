import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../../_common/enums/http-codes.enum";
import { createModelRawRouteGuards } from "../../_common/helpers/create-model-guards.helper";
import { IMechanic } from "../interfaces/car-master.interface";
import { get_mechanic_by_id } from "../repos/car-master.repo";



export const MechanicRouteGuards = createModelRawRouteGuards({
  get_model_fn: get_mechanic_by_id,
  model_name: 'mechanic',
  request_param_id_name: 'mechanic_id',
  model_owner_field: 'user_id',
});



export async function MechanicExistsStrong(
  request: Request,
  response: Response,
  next: NextFunction
) {
  // assume this guard comes after YouAuthorized and that response.locals.you exists
  const mechanic_id = parseInt(request.params.mechanic_id, 10);
  const mechanic_model: IMechanic | null = await get_mechanic_by_id(mechanic_id);
  if (!mechanic_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Mechanic not found`
    });
  }
  if (mechanic_model.user_id !== response.locals.you.id) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Not user's mechanic profile`
    });
  }
  response.locals.mechanic_model = mechanic_model;
  return next();
}