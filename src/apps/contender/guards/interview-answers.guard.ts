import { NextFunction, Request, Response } from 'express';
import { get_interview_answer_by_id } from '../repos/interviews.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function ContenderInterviewAnswerExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_answer_id = parseInt(request.params.interview_answer_id, 10);
  const interview_answer_model = await get_interview_answer_by_id(interview_answer_id);
  if (!interview_answer_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `ContenderInterviewAnswer not found`
    });
  }
  response.locals.interview_answer_model = interview_answer_model;
  return next();
}

export async function IsContenderInterviewAnswerOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_answer_model = <IMyModel> response.locals.interview_answer_model;
  const isOwner: boolean = response.locals.you.id === interview_answer_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not interview_answer owner`
    });
  }
  return next();
}

export async function IsNotContenderInterviewAnswerOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_answer_model = <IMyModel> response.locals.interview_answer_model;
  const isOwner: boolean = response.locals.you.id === interview_answer_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is interview_answer owner`
    });
  }
  return next();
}
