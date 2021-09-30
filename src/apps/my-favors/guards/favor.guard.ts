import { NextFunction, Request, Response } from 'express';
import { get_favor_by_id } from '../repos/favors.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function FavorExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const favor_id = parseInt(request.params.favor_id, 10);
  const favor_model = await get_favor_by_id(favor_id);
  if (!favor_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Favor not found`
    });
  }
  response.locals.favor_model = favor_model;
  return next();
}

export async function IsFavorOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const favor_model = <IMyModel> response.locals.favor_model;
  const isOwner: boolean = response.locals.you.id === favor_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not favor owner`
    });
  }
  return next();
}

export async function IsNotFavorOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const favor_model = <IMyModel> response.locals.favor_model;
  const isOwner: boolean = response.locals.you.id === favor_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is favor owner`
    });
  }
  return next();
}

export async function IsFavorActive(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const favor_model = <IMyModel> response.locals.favor_model;

  if (favor_model.get('canceled')) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Favor is canceled.`
    });
  }
  if (favor_model.get('fulfilled')) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Favor is fulfilled.`
    });
  }

  return next();
}