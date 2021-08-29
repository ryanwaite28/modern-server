import {
  Request,
  Response,
} from 'express';
import {
  IUser
} from '../interfaces/common.interface';
import {
  fn,
} from 'sequelize';
import * as CommonRepo from '../repos/_common.repo';
import {
  populate_common_notification_obj,
} from '../common.chamber';
import { TokensService } from './tokens.service';
import { HttpStatusCode } from '../enums/http-codes.enum';

import { Notifications, Users } from '../models/user.model';


export class NotificationsService {
  // request handlers

  static async get_user_notifications(request: Request, response: Response) {
    const you: IUser = { ...response.locals.you }; 
    const notification_id = parseInt(request.params.notification_id, 10);
    const notifications_models = await CommonRepo.paginateTable(
      Notifications,
      'to_id',
      you.id,
      notification_id
    );

    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const notificationObj = await populate_common_notification_obj(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, { notification: notification_model.toJSON() });
        newList.push(notification_model.toJSON());
      }
    }

    return response.status(HttpStatusCode.OK).json({
      data: newList,
    });
  }

  static async get_user_notifications_all(request: Request, response: Response) {
    const you: IUser = response.locals.you; 
    const notifications_models = await CommonRepo.getAll(
      Notifications,
      'to_id',
      you.id,
    );
    
    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const notificationObj = await populate_common_notification_obj(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, notification_model);
        newList.push(notification_model.toJSON());
      }
    }

    return response.status(HttpStatusCode.OK).json({
      data: newList
    });
  }

  static async update_user_last_opened(request: Request, response: Response) {
    const you: IUser = { ...response.locals.you }; 
    // update user last opened
    await Users.update(<any> { notifications_last_opened: fn('NOW') }, { where: { id: you.id } });
    const newYouModel = await Users.findOne({
      where: { id: you.id },
      attributes: { exclude: ['password'] }
    });
    const newYou = <any> newYouModel!.toJSON();
    // create new token and return
    const jwt = TokensService.newJwtToken(request, newYou, true);

    return response.status(HttpStatusCode.OK).json({
      you: newYou,
      token: jwt
    });
  }

  static async get_notifications_polling(request: Request, response: Response) {
    
  }
}