import { NextFunction, Request, Response } from 'express';
import { get_marker_by_id } from '../repos/markers.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function MarkerExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const marker_id = parseInt(request.params.marker_id, 10);
  const marker_model = await get_marker_by_id(marker_id);
  if (!marker_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Marker not found`
    });
  }
  response.locals.marker_model = marker_model;
  return next();
}

export async function IsMarkerOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const marker_model = <IMyModel> response.locals.marker_model;
  const isOwner: boolean = response.locals.you.id === marker_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not marker owner`
    });
  }
  return next();
}

export async function IsNotMarkerOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const marker_model = <IMyModel> response.locals.marker_model;
  const isOwner: boolean = response.locals.you.id === marker_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is marker owner`
    });
  }
  return next();
}