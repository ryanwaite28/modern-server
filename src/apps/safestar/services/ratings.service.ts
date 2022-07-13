import { create_notification } from '../../_common/repos/notifications.repo';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { Users } from '../../_common/models/user.model';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { ServiceMethodResults, ServiceMethodAsyncResults } from '../../_common/types/common.types';
import { create_rating_via_model } from "../repos/ratings.repo";
import { create_rating_required_props, validateData } from "../safestar.chamber";
import { MyModelStatic } from '../../_common/models/common.model-types';




export class CommonRatingsServices {
  static async create_rating(ratingsModel: MyModelStatic, data: any) {
    const createObj: any = {};
    const dataValidation = validateData({
      data, 
      validators: create_rating_required_props,
      mutateObj: createObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const new_rating = await create_rating_via_model(ratingsModel, createObj);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `New rating created`,
        data: new_rating
      }
    };
    return serviceMethodResults;
  }
}