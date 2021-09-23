import { NextFunction, Request, Response } from 'express';
import { get_interview_question_by_id } from '../repos/interviews.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IMyModel } from '../../_common/models/common.model-types';


export async function ContenderInterviewQuestionExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_question_id = parseInt(request.params.interview_question_id, 10);
  const interview_question_model = await get_interview_question_by_id(interview_question_id);
  if (!interview_question_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `ContenderInterviewQuestion not found`
    });
  }
  response.locals.interview_question_model = interview_question_model;
  return next();
}

export async function IsContenderInterviewQuestionOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_question_model = <IMyModel> response.locals.interview_question_model;
  const isOwner: boolean = response.locals.you.id === interview_question_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not interview_question owner`
    });
  }
  return next();
}

export async function IsNotContenderInterviewQuestionOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const interview_question_model = <IMyModel> response.locals.interview_question_model;
  const isOwner: boolean = response.locals.you.id === interview_question_model.get('owner_id');
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Is interview_question owner`
    });
  }
  return next();
}
