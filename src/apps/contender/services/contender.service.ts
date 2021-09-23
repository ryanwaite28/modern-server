import {
  Request,
  Response,
} from 'express';
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

import * as UserRepo from '../../_common/repos/users.repo';
import * as FollowsRepo from '../../_common/repos/follows.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import { create_notification } from '../../_common/repos/notifications.repo';
import { Follows, Users } from '../../_common/models/user.model';
import { COMMON_EVENT_TYPES } from '../../_common/enums/common.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import { ContenderUserSettings } from '../models/contender.model';

export class ContenderService {
  
  static async get_settings(request: Request, response: Response) {
    const you = response.locals.you;

    let settings = await ContenderUserSettings.findOne({
      where: { user_id: you.id }
    });
    if (!settings) {
      settings = await ContenderUserSettings.create({
        user_id: you.id
      });
    }

    return response.status(HttpStatusCode.OK).json({
      data: settings
    });
  }

  static async update_settings(request: Request, response: Response) {
    // const you = response.locals.you;
    // const data = request.body;

    // const updatesObj: any = {};

    // let settings = await DeliverMeUserProfileSettings.findOne({
    //   where: { user_id: you.id }
    // });
    // if (!settings) {
    //   settings = await DeliverMeUserProfileSettings.create({
    //     user_id: you.id
    //   });
    // }

    // for (const prop of deliveryme_user_settings_required_props) {
    //   if (!data.hasOwnProperty(prop.field)) {
    //     return response.status(HttpStatusCode.BAD_REQUEST).json({
    //       message: `${prop.name} is required.`
    //     });
    //   }
    //   const isValid: boolean = prop.validator(data[prop.field]);
    //   if (!isValid) {
    //     return response.status(HttpStatusCode.BAD_REQUEST).json({
    //       message: `${prop.name} is invalid.`
    //     });
    //   }
    //   updatesObj[prop.field] = data[prop.field];
    // }

    // const updates = await settings.update(updatesObj);

    // return response.status(HttpStatusCode.OK).json({
    //   message: `Updated settings successfully!`,
    //   data: settings,
    // });
  }

}