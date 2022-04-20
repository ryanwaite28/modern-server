import { UploadedFile } from 'express-fileupload';
import {
  fn, col, cast, Op
} from 'sequelize';
import { COMMON_TRANSACTION_STATUS, MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { IMyModel } from '../../_common/models/common.model-types';
import { create_notification } from '../../_common/repos/notifications.repo';
import { getAll, paginateTable } from '../../_common/repos/_common.repo';
import { GoogleService } from '../../_common/services/google.service';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';
import { StripeService } from '../../_common/services/stripe.service';
import { send_sms } from '../../../sms-client';
import { check_model_args, getUserFullName, user_attrs_slim, validateAndUploadImageFile, validateData, validatePhone } from '../../_common/common.chamber';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { UserPaymentIntents, Users } from '../../_common/models/user.model';
import { FavorCancellations, FavorHelpers, FavorMessages, Favors, FavorUpdates } from '../models/favor.model';
import { MyfavorsUserProfileSettings } from '../models/myfavors.model';
import {
  create_favor_update_required_props,
  create_update_favor_required_props,
  favor_date_needed_validator,
  myfavors_user_settings_required_props,
  populate_myfavors_notification_obj
} from '../myfavors.chamber';
import { ICreateUpdateFavor } from '../interfaces/myfavors.interface';
import { MYFAVORS_EVENT_TYPES, MYFAVORS_NOTIFICATION_TARGET_TYPES } from '../enums/myfavors.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../../_common/types/common.types';
import { CatchAsyncServiceError } from '../../_common/decorators/common.decorator';
import { browse_featured_favors, browse_map_favors, browse_recent_favors, create_favor, create_favor_update, delete_favor, favorMasterIncludes, get_favor_by_id, update_favor } from '../repos/favors.repo';



const favorCommonFindCriteria = {
  include: [
    {
      model: FavorHelpers,
      as: 'favor_helpers',
      attributes: { exclude: ['id'] },
      duplicating: false,
      include: [{
        model: Users,
        as: 'helper',
        attributes: user_attrs_slim,
      }]
    },
    {
      model: Users,
      as: 'owner',
      attributes: user_attrs_slim,
    }
  ],
  where: {
    datetime_fulfilled: null,
    // helpers_wanted: {
    //   [Op.lte]: cast(col('myfavors_favors.helpers_wanted'), 'integer')
    // },
  },
  attributes: {
    include: [
      [cast(fn('COUNT', col('favor_helpers.favor_id')), 'integer') ,'helpers_count'],
    ]
  },
  limit: 5,
  group: ['favor_helpers.id', 'myfavors_favors.id', 'favor_helpers.helper.id', 'owner.id'],
  order: [fn('RANDOM')],
};



export class FavorsService {

  @CatchAsyncServiceError()
  static async search_favors(options: {
    you_id: number,
    city: string,
    state: string,
  }): ServiceMethodAsyncResults {
    let { you_id, city, state } = options;

    const useFind = Object.assign({}, favorCommonFindCriteria);
    (<any> useFind.where)['city'] = city;
    (<any> useFind.where)['state'] = state;
    (<any> useFind.where)['owner_id'] = {
      [Op.ne]: you_id
    };

    const results: any[] = [];
    const resultsMap: PlainObject = {};
    const excludeIds: any[] = [];

    while (results.length < 5) {
      (<any> useFind.where)['id'] = {
        [Op.notIn]: excludeIds
      };
      const query_results = await Favors.findAll(<any> useFind);
      console.log({ query_results });
      if (!query_results.length) {
        break;
      }
      for (const favor_model of query_results) {
        if (resultsMap[favor_model.get('id')]) {
          continue;
        }
        const helpers_wanted = favor_model.get('helpers_wanted');
        const helpers_count = favor_model.get('helpers_count');
        if (helpers_count < helpers_wanted) {
          results.push(favor_model);
          excludeIds.push(favor_model.get('id'));
          resultsMap[favor_model.get('id')] = true;
        }
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results,
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async send_favor_message(options: {
    you: IUser,
    body: string,
    favor_model?: IMyModel,
    favor_id?: number,
  }): ServiceMethodAsyncResults {
    const { you, body, favor_id, favor_model } = options;
    
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not a helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
    }
    
    if (!body.trim()) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Body cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    // create the new message
    const new_message_model = await FavorMessages.create({
      body: body.trim(),
      favor_id: favorObj.id,
      user_id: you.id
    });

    const new_message = await FavorMessages.findOne({
      where: { id: new_message_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim,
      }]
    });

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = favorObj.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_NEW_MESSAGE;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        event,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
  
        const eventData = {
          event,
          message: `New favor message for: ${favorObj.title}`,
          micro_app: MODERN_APP_NAMES.MYFAVORS,
          data: new_message!.toJSON() as any,
          user_id: you.id,
          // notification,
        }
        const TO_ROOM = `${MYFAVORS_EVENT_TYPES.TO_FAVOR}:${favorObj.id}`;
        // console.log({ TO_ROOM, eventData });
        SocketsService.get_io().to(TO_ROOM).emit(TO_ROOM, eventData);
        
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: eventData
        });
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor message sent successfully!`,
        data: new_message,
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async create_favor_update(options: {
    you: IUser,
    favor_model?: IMyModel,
    favor_id?: number,
    update_image: UploadedFile | undefined,
    data: {
      message: string,
      helper_lat: number,
      helper_lng: number,
    }
  }): ServiceMethodAsyncResults {
    const { you, data, update_image, favor_id, favor_model } = options;
    
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
      if (!helper) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not a helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
    }

    const createObj: any = {
      user_id: you.id,
      favor_id: favorObj.id,
    };

    const dataValidation = validateData({
      data, 
      validators: create_favor_update_required_props,
      mutateObj: createObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const imageValidation = await validateAndUploadImageFile(update_image, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const new_favor_update_model = await create_favor_update(createObj);

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = favorObj!.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_NEW_UPDATE;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR_UPDATE,
        target_id: new_favor_update_model.get('id') as number
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data: new_favor_update_model,
            message: `Favor new update!`,
            user: you,
            // notification,
          }
        });
  
        const owner_phone = favorObj.owner.phone;
        if (validatePhone(owner_phone)) {
          GoogleService.getLocationFromCoordinates(createObj.helper_lat, createObj.helper_lng)
            .then((placeData) => {
              const msg = `ModernApps ${MODERN_APP_NAMES.MYFAVORS} - Favor: new update for favor "${favorObj.title}"\n\n` +
              `${createObj.message}\n\n` +
              `Helper's Location: ${placeData.city}, ${placeData.state} ` +
                `${placeData.county ? '(' + placeData.county + ')' : ''} ${placeData.zipcode}`;
              console.log(`sending:`, msg);
              
              send_sms({
                to_phone_number: owner_phone,
                message: msg,
              })
            })
            .catch((error) => {
              console.log(`Can't send sms with location; sending without...`);
              const msg = `ModernApps ${MODERN_APP_NAMES.MYFAVORS} - Favor: new update for favor "${favorObj.title}"\n\n` +
              `${createObj.message}`;
              console.log(`sending:`, msg);
              
              send_sms({
                to_phone_number: owner_phone,
                message: msg,
              })
            });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor new update!`,
        data: new_favor_update_model,
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_favor_by_id(favor_id: number): ServiceMethodAsyncResults {
    const favor: IMyModel | null = await get_favor_by_id(favor_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        data: favor
      }
    };
    return serviceMethodResults;
  }
  
  @CatchAsyncServiceError()
  static async get_user_favors_all(user_id: number): ServiceMethodAsyncResults {
    const results = await getAll(
      Favors,
      'owner_id',
      user_id,
      favorMasterIncludes,
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_user_favors(user_id: number, favor_id: number | undefined): ServiceMethodAsyncResults {
    const results = await paginateTable(
      Favors,
      'owner_id',
      user_id,
      favor_id,
      favorMasterIncludes,
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_user_favor_helpings_all_active(user_id: number): ServiceMethodAsyncResults {
    const results = await getAll(
      FavorHelpers,
      'user_id',
      user_id,
      [{
        model: Favors,
        as: 'favor',
        include: favorMasterIncludes,
        where: { datetime_fulfilled: null }
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_user_favor_helpings_active(user_id: number, favor_id: number | undefined): ServiceMethodAsyncResults {
    const results = await paginateTable(
      FavorHelpers,
      'user_id',
      user_id,
      favor_id,
      [{
        model: Favors,
        as: 'favor',
        include: favorMasterIncludes,
        where: { datetime_fulfilled: null }
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_user_favor_helpings_all_past(user_id: number): ServiceMethodAsyncResults {
    const results = await getAll(
      FavorHelpers,
      'user_id',
      user_id,
      [{
        model: Favors,
        as: 'favor',
        include: favorMasterIncludes,
        where: { datetime_fulfilled: { [Op.ne]: null } },
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_user_favor_helpings_past(user_id: number, favor_id: number | undefined): ServiceMethodAsyncResults {
    const results = await paginateTable(
      FavorHelpers,
      'user_id',
      user_id,
      favor_id,
      [{
        model: Favors,
        as: 'favor',
        include: favorMasterIncludes,
        where: { datetime_fulfilled: { [Op.ne]: null } }
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async browse_recent_favors(params: {
    you_id: number,
    favor_id?: number,
  }) {
    const favors = await browse_recent_favors(params.you_id, params.favor_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: favors,
      }
    };
    return serviceMethodResults;
  }

  static async browse_featured_favors(params: {
    you_id: number,
    favor_id?: number,
  }) {
    const favors = await browse_featured_favors(params.you_id, params.favor_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: favors,
      }
    };
    return serviceMethodResults;
  }

  static async browse_map_favors(params: {
    you_id: number,
    swLat: number,
    swLng: number,
    neLat: number,
    neLng: number,
  }) {
    if (!params) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Query data/params not given.`,
          data: {},
        }
      };
      return serviceMethodResults;
    }

    if (!params.swLat) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `SouthWest Latitude not given.`,
          data: {},
        }
      };
      return serviceMethodResults;
    }
    if (!params.swLng) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `SouthWest Longitude not given.`,
          data: {},
        }
      };
      return serviceMethodResults;
    }
    if (!params.neLat) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `NorthEast Latitude not given.`,
          data: {},
        }
      };
      return serviceMethodResults;
    }
    if (!params.neLng) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `NorthEast Longitude not given.`,
          data: {},
        }
      };
      return serviceMethodResults;
    }

    const favors = await browse_map_favors(params);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: favors,
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async create_favor(options: {
    you: IUser,
    favor_image: UploadedFile | undefined,
    data: PlainObject | ICreateUpdateFavor,
  }): ServiceMethodAsyncResults {
    try {
      const { you, favor_image, data } = options;
      const createObj: PlainObject = {
        owner_id: you.id
      };
      
      let date_needed: Date | string = data.date_needed;
      let time_needed: string | undefined = data.time_needed;
      const date_str = `${date_needed}T${time_needed}`;
      let datetime_needed: Date | null = date_needed.constructor === Date
        ? date_needed
        : date_needed && time_needed
          ? new Date(date_str) 
          : null;

      console.log({ date_needed, time_needed, date_str, datetime_needed });
      if (!datetime_needed) {
        datetime_needed = null;
      }
      else {
        const isValidDate = favor_date_needed_validator(date_str);
        console.log({ isValidDate });
        if (!isValidDate) {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: `Date Time is invalid.`
            }
          };
          return serviceMethodResults;
        }
        createObj['date_needed'] = datetime_needed.toISOString();
      }

      const dataValidation = validateData({
        data, 
        validators: create_update_favor_required_props,
        mutateObj: createObj
      });
      if (dataValidation.error) {
        return dataValidation;
      }
  
      const imageValidation = await validateAndUploadImageFile(favor_image, {
        treatNotFoundAsError: false,
        mutateObj: createObj,
        id_prop: 'item_image_id',
        link_prop: 'item_image_link',
      });
      if (imageValidation.error) {
        return imageValidation;
      }

      console.log(`createObj`, createObj);

      const new_favor_model = await create_favor(createObj as ICreateUpdateFavor);
      console.log({ new_favor_model });

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `New Favor Created!`,
          data: new_favor_model
        }
      };
      return serviceMethodResults;
    }
    catch (e) {
      console.log(e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: `Could not create new favor`,
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  @CatchAsyncServiceError()
  static async update_favor(options: {
    you: IUser,
    favor_model?: IMyModel,
    favor_id?: number,
    data: PlainObject | ICreateUpdateFavor,
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model, data } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.fulfilled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is already fulfilled.`,
        }
      };
      return serviceMethodResults;
    }
    if (favorObj.startd) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is already started.`,
        }
      };
      return serviceMethodResults;
    }
    if (favorObj.owner_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Not favor owner.`,
        }
      };
      return serviceMethodResults;
    }

    const updateObj: any = {
      owner_id: you.id
    };

    const dataValidation = validateData({
      data, 
      validators: create_update_favor_required_props,
      mutateObj: updateObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const updates = await update_favor(updateObj as ICreateUpdateFavor, favorObj.id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor Updated!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async delete_favor(favor_id?: number, favor_model?: IMyModel): ServiceMethodAsyncResults {
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.fulfilled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is already fulfilled.`,
        }
      };
      return serviceMethodResults;
    }
    if (favorObj.startd) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is already started.`,
        }
      };
      return serviceMethodResults;
    }

    const deletes = await delete_favor(favorObj.id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor Deleted!`,
        data: deletes,
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async assign_favor(options: {
    you: IUser,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.owner_id === you.id) {
      // if not owner, check if is helper
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor owner cannot be assigned as helper.`,
        }
      };
      return serviceMethodResults;
    }

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
    if (helper) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Already a helper of this favor.`,
        }
      };
      return serviceMethodResults;
    }

    if (favorObj.favor_helpers.length === favorObj.helpers_wanted) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Max helpers wanted reached.`,
        }
      };
      return serviceMethodResults;
    }

    // the lead helper is sent when there are no other helpers
    const is_lead = !favorObj.favor_helpers.length

    let new_helper_model = await FavorHelpers.create({ 
      favor_id: favorObj.id, user_id: you.id, is_lead
    });
    const new_helper = await new_helper_model.get();

    const data = await get_favor_by_id(favorObj.id);

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = data!.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_HELPER_ASSIGNED;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            new_helper,
            message: `Favor helper ${getUserFullName(user)} was assigned to "${favorObj.title}"`,
            user: you,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: Favor helper ${getUserFullName(user)} was assigned to "${favorObj.title}"`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor helper assigned!`,
        data: {
          new_helper,
          favor: data,
        }
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async unassign_favor(options: {
    you: IUser,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not a helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
    }

    const deletes = await FavorHelpers.destroy({ 
      where: { favor_id: favorObj.id, user_id: you.id }
    });

    const data = await get_favor_by_id(favorObj.id);

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = data!.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_HELPER_UNASSIGNED;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            deletes,
            message: `Favor helper ${getUserFullName(user)} was unassigned from "${favorObj.title}"`,
            user: you,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: Favor helper ${getUserFullName(user)} was unassigned from "${favorObj.title}"`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor helper unassigned!`,
        data: {
          deletes,
          favor: data,
        },
      }
    };
    return serviceMethodResults;
  }
  
  @CatchAsyncServiceError()
  static async mark_favor_as_started(options: {
    you: IUser,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.datetime_started) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is already started.`,
        }
      };
    }

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is lead helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not a helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
  
      if (!helper.is_lead) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not lead helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
    }

    check.info.data.datetime_started = fn('NOW');
    const updates = await check.info.data.save({ fields: ['datetime_started'] });
    
    const data = await get_favor_by_id(favorObj.id);

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = favorObj.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_STARTED;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            message: `Favor "${favorObj.title}" was canceled`,
            user: you,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: Favor "${favorObj.title}" was started`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor started!`,
        data: {
          updates,
          favor: data,
        },
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async mark_favor_as_fulfilled(options: {
    you: IUser,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model } = options;
    const check: ServiceMethodResults<IMyModel | undefined> = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data!.toJSON();

    if (favorObj.datetime_fulfilled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is already fulfilled.`,
        }
      };
      return serviceMethodResults;
    }

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is lead helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not a helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
  
      if (!helper.is_lead) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not lead helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
    }

    // check.info.data.datetime_fulfilled = fn('NOW');
    const updates = await check.info.data!.update({ fulfilled: fn(`NOW`) });
    
    const data = await get_favor_by_id(favorObj.id);

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = favorObj.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_FULFILLED;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            message: `Favor "${favorObj.title}" was fulfilled`,
            user: you,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: Favor "${favorObj.title}" was fulfilled`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor fulfilled!`,
        data: {
          updates,
          favor: data,
        }
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async mark_favor_as_canceled(options: {
    you: IUser,
    favor_id?: number,
    favor_model?: IMyModel,
    reason?: string,
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model, reason } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.canceled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Favor is already canceled.`,
        }
      };
      return serviceMethodResults;
    }

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is lead helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not a helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
  
      if (!helper.is_lead) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Not lead helper of this favor.`,
          }
        };
        return serviceMethodResults;
      }
    }

    check.info.data.canceled = true;
    check.info.data.datetime_started = null;
    const updates = await check.info.data.save({ fields: ['canceled', 'started'] });

    const trackingDeletes = await FavorUpdates.destroy({ 
      where: { favor_id: favorObj.id }
    });
    const messagesDeletes = await FavorMessages.destroy({ 
      where: { favor_id: favorObj.id }
    });
    const helpersDelete = await FavorHelpers.destroy({ 
      where: { favor_id: favorObj.id }
    });
    const cancellation = await FavorCancellations.create({
      favor_id: favorObj.id,
      reason: reason || '',
    });

    const data = await get_favor_by_id(favorObj.id);

    let notify_users = [];

    if (favorObj.owner_id !== you.id) {
      // send to each helper
      const other_helpers = favorObj.favor_helpers.filter((helper: any) => helper.user_id !== you.id).map((helper: any) => helper.helper);
      notify_users = [favorObj.owner, ...other_helpers];
    } else {
      // send to owner and every other helper
      notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);
    }

    const event = MYFAVORS_EVENT_TYPES.FAVOR_CANCELED;

    for (const user of notify_users) {
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            message: `Favor "${favorObj.title}" was canceled`,
            user: you,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: Favor "${favorObj.title}" was canceled`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor canceled!`,
        data: {
          updates,
          favor: data,
        }
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async mark_favor_as_uncanceled(options: {
    you: IUser,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, favor_id, favor_model } = options;
    const check: ServiceMethodResults<IMyModel> = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data!.toJSON();

    if (!favorObj.canceled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Favor is not canceled.`,
        }
      };
      return serviceMethodResults;
    }

    check.info.data!.canceled = false;
    const updates = await check.info.data!.save({ fields: ['canceled'] });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor uncanceled!`,
        data: updates
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async mark_helper_as_helped(options: {
    you: IUser,
    user_id: number,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, user_id, favor_id, favor_model } = options;
    const check: ServiceMethodResults<IMyModel> = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data!.toJSON();

    if (favorObj.canceled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is canceled.`,
        }
      };
      return serviceMethodResults;
    }
    if (favorObj.canceled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is fulfilled.`,
        }
      };
      return serviceMethodResults;
    }

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === user_id);
    if (!helper) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Helper user not found by id: ${user_id}`,
        }
      };
      return serviceMethodResults;
    }

    const updates = await FavorHelpers.update({ helped: true }, { 
      where: { favor_id: favorObj.id, user_id }
    });
    
    const data = await get_favor_by_id(favorObj.id);

    let notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);

    const event = MYFAVORS_EVENT_TYPES.FAVOR_HELPER_HELPED;

    for (const user of notify_users) {
      const msg = `${getUserFullName(user)} was marked as helped for Favor "${favorObj.title}"`;
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            message: msg,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: ${msg}`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Favor helper marked as helped!`,
        data: {
          updates,
          favor: data,
        }
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async mark_helper_as_unhelped(options: {
    you: IUser,
    user_id: number,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, user_id, favor_id, favor_model } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    if (favorObj.canceled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is canceled.`,
        }
      };
      return serviceMethodResults;
    }
    if (favorObj.fulfilled) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Favor is fulfilled.`,
        }
      };
      return serviceMethodResults;
    }

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === user_id);
    if (!helper) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Helper user not found by id: ${user_id}`,
        }
      };
      return serviceMethodResults;
    }

    const updates = await FavorHelpers.update({ helped: true }, { 
      where: { favor_id: favorObj.id, user_id }
    });
    
    const data = await get_favor_by_id(favorObj.id);

    let notify_users = favorObj.favor_helpers.map((helper: any) => helper.helper);

    const event = MYFAVORS_EVENT_TYPES.FAVOR_HELPER_UNHELPED;

    for (const user of notify_users) {
      const msg = `${getUserFullName(user)} was marked as un-helped for Favor "${favorObj.title}"`;
      create_notification({
        from_id: you.id,
        to_id: user.id,
        event,
        micro_app: MODERN_APP_NAMES.MYFAVORS,
        target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
        target_id: favorObj.id
      }).then(async (notification_model) => {
        // const notification = await populate_myfavors_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: {
            data,
            message: msg,
            // notification,
          }
        });
  
        const to_phone_number = user.phone;
        if (validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.MYFAVORS}: ${msg}`,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.BAD_REQUEST,
      error: true,
      info: {
        message: `Favor helper marked as unhelped!`,
        data: {
          updates,
          favor: data,
        }
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async get_settings(you_id: number): ServiceMethodAsyncResults {
    let settings = await MyfavorsUserProfileSettings.findOne({
      where: { user_id: you_id }
    });
    if (!settings) {
      settings = await MyfavorsUserProfileSettings.create({
        user_id: you_id
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        data: settings
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async update_settings(options: {
    you_id: number,
    data: PlainObject,
  }): ServiceMethodAsyncResults {
    const { you_id, data } = options;

    const updatesObj: any = {};

    let settings = await MyfavorsUserProfileSettings.findOne({
      where: { user_id: you_id }
    });
    if (!settings) {
      settings = await MyfavorsUserProfileSettings.create({
        user_id: you_id
      });
    }

    const dataValidation = validateData({
      data, 
      validators: myfavors_user_settings_required_props,
      mutateObj: updatesObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const updates = await settings.update(updatesObj);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Updated settings successfully!`,
        data: {
          updates,
          data: settings,
        }
      }
    };
    return serviceMethodResults;
  }

  @CatchAsyncServiceError()
  static async pay_helper(options: {
    you: IUser,
    user: IUser,
    favor_id?: number,
    favor_model?: IMyModel
  }): ServiceMethodAsyncResults {
    const { you, user, favor_id, favor_model } = options;
    const check: ServiceMethodResults = await check_model_args({ model_id: favor_id, model: favor_model, get_model_fn: get_favor_by_id });
    if (check.error) {
      return check;
    }
    const favorObj: any = check.info.data.toJSON();

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === user.id);

    if (!helper) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.FORBIDDEN,
        error: true,
        info: {
          message: `No helper user found by id ${user.id}`
        }
      };
      return serviceMethodResults;
    }
    if (helper.paid) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Helper already paid`
        }
      };
      return serviceMethodResults;
    }

    // if (!helper.helped) {
    //   return response.status(HttpStatusCode.FORBIDDEN).json({
    //     message: `Helper not marked as helped`
    //   });
    // }

    let paymentIntent;
    
    try {
      const chargeFeeData = StripeService.add_on_stripe_processing_fee(favorObj.payout_per_helper);
      paymentIntent = await StripeService.stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: chargeFeeData.final_total,
        currency: 'usd',
        application_fee_amount: chargeFeeData.app_fee, 
        transfer_data: {
          destination: user.stripe_account_id,
        },
        metadata: {
          user_id: you.id,
          payment_intent_event: MYFAVORS_EVENT_TYPES.FAVOR_FULFILLED,
          micro_app: MODERN_APP_NAMES.MYFAVORS,
          target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
          target_id: favorObj.id,
          helper_user_id: user.id
        }
      },
      // { stripeAccount: you.stripe_account_id }
      );
    }
    catch (err) {
      console.log((<any> err).message);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: (<any> err).message,
          error: err,
        }
      };
      return serviceMethodResults;
    }
    
    const newIntent = await UserPaymentIntents.create({
      user_id: you.id,
      payment_intent_id: paymentIntent.id,
      payment_intent_event: MYFAVORS_EVENT_TYPES.FAVOR_FULFILLED,
      micro_app: MODERN_APP_NAMES.MYFAVORS,
      target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
      target_id: favorObj.id,
      status: COMMON_TRANSACTION_STATUS.PENDING
    });

    console.log({ newIntent, paymentIntent });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Payment intent created`,
        data: {
          payment_client_secret: paymentIntent.client_secret,
          stripe_pk: process.env.STRIPE_PK,
        }
      }
    };
    return serviceMethodResults;
  }
}
