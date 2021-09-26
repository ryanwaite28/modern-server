import { NextFunction, Request, Response } from 'express';
import { get_post_by_id } from '../repos/posts.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function HotspotPostExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const post_id = parseInt(request.params.post_id, 10);
  const post_model = await get_post_by_id(post_id);
  if (!post_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Post not found`
    });
  }
  response.locals.post_model = post_model;
  return next();
}

export async function IsHotspotPostOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const post_model = <IMyModel> response.locals.post_model;
  const isOwner: boolean = response.locals.you.id === post_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not post owner`
    });
  }
  return next();
}

export async function IsNotHotspotPostOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const post_model = <IMyModel> response.locals.post_model;
  const isOwner: boolean = response.locals.you.id === post_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is post owner`
    });
  }
  return next();
}