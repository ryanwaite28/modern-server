import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { 
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';
import { ExpressResponse } from '../../_common/types/common.types';



export class ContenderInterviewAnswersRequestHandler {
  
  static async get_interview_answer_by_id(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      data: response.locals.interview_answer_model
    });
  }

}