import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';
import {
  get_reply_by_id as get_post_comment_reply_by_id
} from '../repos/post-comment-replies.repo';

export async function PostCommentReplyExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const reply_id = parseInt(request.params.reply_id, 10);
  const reply_model = await get_post_comment_reply_by_id(reply_id);
  if (!reply_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Reply not found`
    });
  }
  response.locals.reply_model = reply_model;
  return next();
}

export async function IsReplyOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const reply_model = <IMyModel> response.locals.reply_model;
  const isOwner: boolean = response.locals.you.id === reply_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not reply owner`
    });
  }
  return next();
}

export async function IsNotReplyOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const reply_model = <IMyModel> response.locals.reply_model;
  const isOwner: boolean = response.locals.you.id === reply_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is reply owner`
    });
  }
  return next();
}