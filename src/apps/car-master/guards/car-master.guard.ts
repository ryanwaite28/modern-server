import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "src/apps/_common/enums/http-codes.enum";
import { IMechanic, IMechanicServiceRequest } from "../interfaces/car-master.interface";
import { get_mechanic_by_id, get_service_request_by_id } from "../repos/car-master.repo";



export async function MechanicExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const mechanic_id = parseInt(request.params.mechanic_id, 10);
  const mechanic_model: IMechanic | null = await get_mechanic_by_id(mechanic_id);
  if (!mechanic_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Mechanic not found`
    });
  }
  response.locals.mechanic_model = mechanic_model;
  return next();
}

export async function ServiceRequestExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const service_request_id = parseInt(request.params.service_request_id, 10);
  const service_request_model: IMechanicServiceRequest | null = await get_service_request_by_id(service_request_id);
  if (!service_request_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Service Request not found`
    });
  }
  response.locals.service_request_model = service_request_model;
  return next();
}