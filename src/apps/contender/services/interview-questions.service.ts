import { Request, Response } from 'express';
import { createGenericServiceMethodSuccess } from '../../_common/common.chamber';
import { IMyModel } from '../../_common/models/common.model-types';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import {
  get_interview_question_by_id,
} from '../repos/interviews.repo';



export class ContenderInterviewsService {
  
  static async get_interview_question_by_id(interview_question_id: number): ServiceMethodAsyncResults {
    const interview_question_model: IMyModel | null = await get_interview_question_by_id(interview_question_id);
    return createGenericServiceMethodSuccess(undefined, interview_question_model);
  }

}