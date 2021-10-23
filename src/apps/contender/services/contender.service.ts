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
import { ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { ContenderUserSettings } from '../models/contender.model';
import { createGenericServiceMethodSuccess } from '../../_common/common.chamber';

export class ContenderService {
  
  static async get_settings(user_id: number): ServiceMethodAsyncResults {
    let settings = await ContenderUserSettings.findOne({
      where: { user_id }
    });
    if (!settings) {
      settings = await ContenderUserSettings.create({ user_id });
    }

    return createGenericServiceMethodSuccess(undefined, settings);
  }

  // static async update_settings(request: Request, response: Response): ServiceMethodAsyncResults {
  //   const you = response.locals.you;
  //   const data = request.body;

  //   const updatesObj: any = {};

  //   let settings = await ContenderUserSettings.findOne({
  //     where: { user_id: you.id }
  //   });
  //   if (!settings) {
  //     settings = await ContenderUserSettings.create({
  //       user_id: you.id
  //     });
  //   }

    

  //   const updates = await settings.update(updatesObj);

  //   return createGenericServiceMethodSuccess(undefined, settings);
  // }

}