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
import { ContenderUserSettings } from '../models/contender.model';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { ContenderService } from '../services/contender.service';



export class ContenderRequestHandler {
  
  static async get_settings(request: Request, response: Response): ExpressResponse {
    const you = response.locals.you;

    const serviceMethodResults: ServiceMethodResults = await ContenderService.get_settings(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  // static async update_settings(request: Request, response: Response): ExpressResponse {

  // }

}