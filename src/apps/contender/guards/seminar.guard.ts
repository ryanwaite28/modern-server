import { NextFunction, Request, Response } from 'express';
import { get_seminar_by_id } from '../repos/seminars.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function ContenderSeminarExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const seminar_id = parseInt(request.params.seminar_id, 10);
  const seminar_model = await get_seminar_by_id(seminar_id);
  if (!seminar_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `ContenderSeminar not found`
    });
  }
  response.locals.seminar_model = seminar_model;
  return next();
}

export async function IsContenderSeminarOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const seminar_model = <IMyModel> response.locals.seminar_model;
  const isOwner: boolean = response.locals.you.id === seminar_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not seminar owner`
    });
  }
  return next();
}

export async function IsNotContenderSeminarOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const seminar_model = <IMyModel> response.locals.seminar_model;
  const isOwner: boolean = response.locals.you.id === seminar_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is seminar owner`
    });
  }
  return next();
}
