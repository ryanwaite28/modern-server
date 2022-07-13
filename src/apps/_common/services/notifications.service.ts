import { Request, Response } from 'express';
import {
  IUser
} from '../interfaces/common.interface';
import {
  fn, WhereOptions,
} from 'sequelize';
import * as CommonRepo from '../repos/_common.repo';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { MODERN_APP_NAMES } from '../enums/common.enum';

import {
  populate_common_notification_obj,
} from '../common.chamber';

import { populate_deliverme_notification_obj } from '../../deliver-me/deliverme.chamber';
import { populate_myfavors_notification_obj } from '../../my-favors/myfavors.chamber';
import { populate_carmaster_notification_obj } from '../../car-master/car-master.chamber';

import { TokensService } from './tokens.service';
import { Notifications, Users } from '../models/user.model';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/common.types';
import { get_user_app_notification_last_opened, update_user_app_notification_last_opened } from '../repos/_common.repo';



export class NotificationsService {
  static notifications_populate_fn_by_app = {
    [MODERN_APP_NAMES.COMMON as string]: populate_common_notification_obj,
    [MODERN_APP_NAMES.DELIVERME as string]: populate_deliverme_notification_obj,
    [MODERN_APP_NAMES.MYFAVORS as string]: populate_myfavors_notification_obj,
    [MODERN_APP_NAMES.CARMASTER as string]: populate_carmaster_notification_obj,
  };
  
  // request handlers

  static async get_user_notifications(user_id: number, notification_id: number): ServiceMethodAsyncResults {
    const notifications_models = await CommonRepo.paginateTable(
      Notifications,
      'to_id',
      user_id,
      notification_id
    );

    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const app = notification_model.get('micro_app') as string;
        const fn = NotificationsService.notifications_populate_fn_by_app[app];
        const notificationObj = await fn(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, { notification: notification_model.toJSON() });
        newList.push(notification_model.toJSON());
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_notifications_all(user_id: number): ServiceMethodAsyncResults {
    const notifications_models = await CommonRepo.getAll(
      Notifications,
      'to_id',
      user_id,
    );
    
    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const app = notification_model.get('micro_app') as string;
        const fn = NotificationsService.notifications_populate_fn_by_app[app];
        const notificationObj = await fn(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, { notification: notification_model.toJSON() });
        newList.push(notification_model.toJSON());
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }


  static async get_user_app_notifications(user_id: number, micro_app: string, notification_id: number): ServiceMethodAsyncResults {
    const where: WhereOptions = { micro_app: micro_app.toUpperCase() };
    console.log({ where });

    const notifications_models = await CommonRepo.paginateTable(
      Notifications,
      'to_id',
      user_id,
      notification_id,
      undefined,
      undefined,
      undefined,
      where
    );

    console.log({ notifications_models });

    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const app = notification_model.get('micro_app') as string;
        const fn = NotificationsService.notifications_populate_fn_by_app[app];
        const notificationObj = await fn(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e);
        console.log({ notification_model });
        throw e;
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_app_notifications_all(user_id: number, micro_app: string): ServiceMethodAsyncResults {
    const where: WhereOptions = { micro_app: micro_app.toUpperCase() };
    console.log({ where });

    const notifications_models = await CommonRepo.getAll(
      Notifications,
      'to_id',
      user_id,
      undefined,
      undefined,
      undefined,
      where
    );
    
    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const app = notification_model.get('micro_app') as string;
        const fn = NotificationsService.notifications_populate_fn_by_app[app];
        const notificationObj = await fn(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, { notification: notification_model.toJSON() });
        newList.push(notification_model.toJSON());
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }



  static async update_user_last_opened(user_id: number): ServiceMethodAsyncResults {
    // update user last opened
    await Users.update(<any> { notifications_last_opened: fn('NOW') }, { where: { id: user_id } });
    const newYouModel = await Users.findOne({
      where: { id: user_id },
      attributes: { exclude: ['password'] }
    });

    const newYou = <any> newYouModel!.toJSON();
    // create new token and return
    const jwt = TokensService.newUserJwtToken(newYou);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: {
          you: newYou,
          token: jwt
        }
      }
    };
    return serviceMethodResults;
  }



  static async get_user_app_notification_last_opened(user_id: number, micro_app: string): ServiceMethodAsyncResults {
    // update user last opened
    const data = await get_user_app_notification_last_opened(user_id, micro_app as MODERN_APP_NAMES);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data,
      }
    };
    return serviceMethodResults;
  }

  static async update_user_app_notification_last_opened(user_id: number, micro_app: string): ServiceMethodAsyncResults {
    // update user last opened
    const updates = await update_user_app_notification_last_opened(user_id, micro_app as MODERN_APP_NAMES);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: updates
      }
    };
    return serviceMethodResults;
  }
}