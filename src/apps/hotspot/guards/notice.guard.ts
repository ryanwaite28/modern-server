import { NextFunction, Request, Response } from 'express';
import { get_notice_by_id } from '../repos/notices.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function NoticeExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const notice_id = parseInt(request.params.notice_id, 10);
  const notice_model = await get_notice_by_id(notice_id);
  if (!notice_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Notice not found`
    });
  }
  response.locals.notice_model = notice_model;
  return next();
}

export async function IsNoticeOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const notice_model = <IMyModel> response.locals.notice_model;
  const isOwner: boolean = response.locals.you.id === notice_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not notice owner`
    });
  }
  return next();
}

export async function IsNotNoticeOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const notice_model = <IMyModel> response.locals.notice_model;
  const isOwner: boolean = response.locals.you.id === notice_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is notice owner`
    });
  }
  return next();
}