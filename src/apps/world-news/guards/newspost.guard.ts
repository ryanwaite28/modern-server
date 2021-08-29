import { NextFunction, Request, Response } from 'express';
import { get_newspost_by_id } from '../repos/newsposts.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function NewsPostExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const newspost_id = parseInt(request.params.newspost_id, 10);
  const newspost_model = await get_newspost_by_id(newspost_id);
  if (!newspost_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `NewsPost not found`
    });
  }
  response.locals.newspost_model = newspost_model;
  return next();
}

export async function IsNewsPostOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const newspost_model = <IMyModel> response.locals.newspost_model;
  const isOwner: boolean = response.locals.you.id === newspost_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not newspost owner`
    });
  }
  return next();
}

export async function IsNotNewsPostOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const newspost_model = <IMyModel> response.locals.newspost_model;
  const isOwner: boolean = response.locals.you.id === newspost_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is newspost owner`
    });
  }
  return next();
}