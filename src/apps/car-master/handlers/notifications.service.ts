import { fn } from 'sequelize';
import { paginateTable, getAll } from '../../_common/repos/_common.repo';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';



import { TokensService } from '../../_common/services/tokens.service';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../../_common/types/common.types';
import { CarmasterNotifications, CarmasterUserProfileSettings } from '../models/car-master.model';
import { populate_carmaster_notification_obj } from '../car-master.chamber';



export class NotificationsService {
  // request handlers

  static async get_user_notifications(user_id: number, notification_id: number): ServiceMethodAsyncResults {
    const notifications_models = await paginateTable(
      CarmasterNotifications,
      'to_id',
      user_id,
      notification_id
    );

    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const notificationObj = await populate_carmaster_notification_obj(notification_model);
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
    const notifications_models = await getAll(
      CarmasterNotifications,
      'to_id',
      user_id,
    );
    
    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const notificationObj = await populate_carmaster_notification_obj(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, notification_model);
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
    await CarmasterUserProfileSettings.update(<any> { notifications_last_opened: fn('NOW') }, { where: { id: user_id } });
    // const newYouModel = await Users.findOne({
    //   where: { id: user_id },
    //   attributes: { exclude: ['password'] }
    // });

    // const newYou = <any> newYouModel!.toJSON();
    // // create new token and return
    // const jwt = TokensService.newUserJwtToken(newYou);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `updated last seen notifications`,
        data: {
          // you: newYou,
          // token: jwt
        }
      }
    };
    return serviceMethodResults;
  }
}