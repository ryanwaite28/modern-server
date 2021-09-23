import { NextFunction, Request, Response } from 'express';
import { get_interview_by_id } from '../repos/interviews.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function ContenderInterviewExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_id = parseInt(request.params.interview_id, 10);
  const interview_model = await get_interview_by_id(interview_id);
  if (!interview_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `ContenderInterview not found`
    });
  }
  response.locals.interview_model = interview_model;
  return next();
}

export async function IsContenderInterviewOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_model = <IMyModel> response.locals.interview_model;
  const isOwner: boolean = response.locals.you.id === interview_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not interview owner`
    });
  }
  return next();
}

export async function IsNotContenderInterviewOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_model = <IMyModel> response.locals.interview_model;
  const isOwner: boolean = response.locals.you.id === interview_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is interview owner`
    });
  }
  return next();
}