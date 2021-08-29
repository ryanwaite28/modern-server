import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';
import { get_comment_by_id as get_newspost_comment_by_id } from '../repos/newspost-comments.repo';

export async function NewsPostCommentExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const comment_id = parseInt(request.params.comment_id, 10);
  const comment_model = await get_newspost_comment_by_id(comment_id);
  if (!comment_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Comment not found`
    });
  }
  response.locals.comment_model = comment_model;
  return next();
}

export async function IsCommentOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const comment_model = <IMyModel> response.locals.comment_model;
  const isOwner: boolean = response.locals.you.id === comment_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not comment owner`
    });
  }
  return next();
}

export async function IsNotCommentOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const comment_model = <IMyModel> response.locals.comment_model;
  const isOwner: boolean = response.locals.you.id === comment_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is comment owner`
    });
  }
  return next();
}