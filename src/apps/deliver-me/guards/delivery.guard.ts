import { NextFunction, Request, Response } from 'express';
import { get_delivery_by_id } from '../repos/deliveries.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';
import { IDelivery } from '../interfaces/deliverme.interface';


export async function DeliveryExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const delivery_id = parseInt(request.params.delivery_id, 10);
  const delivery_model: IDelivery | null = await get_delivery_by_id(delivery_id);
  if (!delivery_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Delivery not found`
    });
  }
  response.locals.delivery_model = delivery_model;
  return next();
}

export async function IsDeliveryOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const delivery_model = <IDelivery> response.locals.delivery_model;
  const isOwner: boolean = response.locals.you.id === delivery_model.owner_id;
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not delivery owner`
    });
  }
  return next();
}

export async function IsNotDeliveryOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const delivery_model = <IDelivery> response.locals.delivery_model;
  const isOwner: boolean = response.locals.you.id === delivery_model.owner_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is delivery owner`
    });
  }
  return next();
}