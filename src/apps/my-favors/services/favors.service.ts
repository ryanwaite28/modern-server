import {
  Request,
  Response,
} from 'express';
import { UploadedFile } from 'express-fileupload';
import {
  fn, col, cast, Op
} from 'sequelize';
import { COMMON_TRANSACTION_STATUS, MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { IRequest, PlainObject } from '../../_common/interfaces/common.interface';
import { IMyModel } from '../../_common/models/common.model-types';
import { create_notification } from '../../_common/repos/notifications.repo';
import { getAll, paginateTable } from '../../_common/repos/_common.repo';
import { GoogleService } from '../../_common/services/google.service';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';
import { StripeService } from '../../_common/services/stripe.service';
import { store_image } from '../../../cloudinary-manager';
import { send_sms } from '../../../sms-client';
import { allowedImages, getUserFullName, user_attrs_slim, validatePhone } from '../../_common/common.chamber';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { UserPaymentIntents, Users } from '../../_common/models/user.model';
import { FavorCancellations, FavorHelpers, FavorMessages, Favors, FavorUpdates } from '../models/favor.model';
import * as FavorsRepo from '../repos/favors.repo';
import { MyfavorsUserProfileSettings } from '../models/myfavors.model';
import { create_favor_update_required_props, create_update_favor_required_props, favor_date_needed_validator, myfavors_user_settings_required_props, populate_myfavors_notification_obj } from '../myfavors.chamber';
import { ICreateUpdateFavor } from '../interfaces/myfavors.interface';
import { MYFAVORS_EVENT_TYPES, MYFAVORS_NOTIFICATION_TARGET_TYPES } from '../enums/myfavors.enum';



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

  static async search_favors(request: Request, response: Response) {
    const you = response.locals.you;
    const city: string = request.body.city;
    const state: string = request.body.state;

    const useFind = Object.assign({}, favorCommonFindCriteria);
    (<any> useFind.where)['city'] = city;
    (<any> useFind.where)['state'] = state;
    (<any> useFind.where)['owner_id'] = {
      [Op.ne]: you.id
    };

    const results: any = [];
    const resultsMap: any = {};
    const excludeIds: any = [];

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

    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async send_favor_message(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not a helper of this favor.`,
        });
      }
    }
    

    const body = request.body.body;
    if (!body || !body.trim()) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Body cannot be empty`
      });
    }

    // create the new message
    const new_message_model = await FavorMessages.create({
      body,
      favor_id: favorObj.id,
      user_id: you.id
    });

    const new_message = await FavorMessages.findOne({
      where: { id: new_message_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
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
          message: `New favor message for: ${favor_model.get('title')}`,
          micro_app: MODERN_APP_NAMES.MYFAVORS,
          data: new_message!.toJSON() as any,
          user_id: you.id,
          // notification,
        }
        const TO_ROOM = `${MYFAVORS_EVENT_TYPES.TO_FAVOR}:${favorObj.id}`;
        // console.log({ TO_ROOM, eventData });
        (<IRequest> request).io.to(TO_ROOM).emit(TO_ROOM, eventData);
        
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: user.id,
          event,
          data: eventData
        });
      });
    }

    

    return response.status(HttpStatusCode.OK).json({
      message: `Favor message sent successfully!`,
      data: new_message,
    });
  }

  static async create_favor_update(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not a helper of this favor.`,
        });
      }
    }

    const createObj: any = {
      user_id: you.id,
      favor_id: favorObj.id,
    };

    const data: PlainObject = JSON.parse(request.body.payload);
    const update_image: UploadedFile | undefined = request.files && (
      <UploadedFile> request.files.update_image
    );

    // console.log(`request.body`, request.body);
    // console.log(`data`, data);
    
    for (const prop of create_favor_update_required_props) {
      if (!data.hasOwnProperty(prop.field)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }
      const isValid: boolean = prop.validator(data[prop.field]);
      if (!isValid) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is invalid.`
        });
      }
      createObj[prop.field] = data[prop.field];
    }
    if (update_image) {
      const type = update_image.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }
      const results = await store_image(update_image);
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }
      createObj.icon_id = results.result.public_id,
      createObj.icon_link = results.result.secure_url
    }

    // console.log(`createObj`, createObj);
    const new_favor_update_model = await FavorsRepo.create_favor_update(createObj);

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


    return response.status(HttpStatusCode.OK).json({
      message: `Favor new update!`,
      data: new_favor_update_model,
    });
  }

  static async get_favor_by_id(request: Request, response: Response) {
    const favor = response.locals.favor_model.toJSON();
    return response.status(HttpStatusCode.OK).json({
      data: favor
    });
  }
  
  static async get_user_favors_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const results = await getAll(
      Favors,
      'owner_id',
      user_id,
      FavorsRepo.favorMasterIncludes,
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_favors(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_id: number | undefined = request.params.favor_id ? parseInt(request.params.favor_id, 10) : undefined;
    const results = await paginateTable(
      Favors,
      'owner_id',
      user_id,
      favor_id,
      FavorsRepo.favorMasterIncludes,
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_favor_helpings_all_active(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const results = await getAll(
      FavorHelpers,
      'user_id',
      user_id,
      [{
        model: Favors,
        as: 'favor',
        include: FavorsRepo.favorMasterIncludes,
        where: { datetime_fulfilled: null }
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_favor_helpings_active(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_id: number | undefined = request.params.favor_id ? parseInt(request.params.favor_id, 10) : undefined;

    console.log({ user_id, favor_id, carrier: true });

    const results = await paginateTable(
      FavorHelpers,
      'user_id',
      user_id,
      favor_id,
      [{
        model: Favors,
        as: 'favor',
        include: FavorsRepo.favorMasterIncludes,
        where: { datetime_fulfilled: null }
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_favor_helpings_all_past(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const results = await getAll(
      FavorHelpers,
      'user_id',
      user_id,
      [{
        model: Favors,
        as: 'favor',
        include: FavorsRepo.favorMasterIncludes,
        where: { datetime_fulfilled: { [Op.ne]: null } },
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_favor_helpings_past(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_id: number | undefined = request.params.favor_id ? parseInt(request.params.favor_id, 10) : undefined;

    console.log({ user_id, favor_id, carrier: true });

    const results = await paginateTable(
      FavorHelpers,
      'user_id',
      user_id,
      favor_id,
      [{
        model: Favors,
        as: 'favor',
        include: FavorsRepo.favorMasterIncludes,
        where: { datetime_fulfilled: { [Op.ne]: null } }
      }],
      undefined,
      undefined,
      undefined,
      [['id', 'DESC']]
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async create_favor(request: Request, response: Response) {
    try {
      const you = response.locals.you;
      const createObj: PlainObject = {
        owner_id: you.id
      };

      const data: PlainObject = JSON.parse(request.body.payload);
      let date_needed: any = data.date_needed;
      let time_needed: any = data.time_needed;
      const date_str = `${date_needed}T${time_needed}`;
      let datetime_needed: Date | null = date_needed && time_needed && new Date(date_str);
      console.log({ date_needed, time_needed, date_str, datetime_needed });
      if (!datetime_needed) {
        datetime_needed = null;
      }
      else {
        const isValidDate = favor_date_needed_validator(date_str);
        console.log({ isValidDate });
        if (!isValidDate) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `Date Time is invalid.`
          });
        }
        createObj['date_needed'] = datetime_needed.toISOString();
      }

      const favor_image: UploadedFile | undefined = request.files && (<UploadedFile> request.files.favor_image);

      console.log(`request.body`, request.body);
      console.log(`data`, data);

      for (const prop of create_update_favor_required_props) {
        if (!data.hasOwnProperty(prop.field)) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `${prop.name} is required.`
          });
        }
        const isValid: boolean = prop.validator(data[prop.field]);
        if (!isValid) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            message: `${prop.name} is invalid.`
          });
        }

        createObj[prop.field] = data[prop.field];
      }

      if (favor_image) {
        const type = favor_image.mimetype.split('/')[1];
        const isInvalidType = !allowedImages.includes(type);
        if (isInvalidType) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: 'Invalid file type: jpg, jpeg or png required...'
          });
        }

        const results = await store_image(favor_image);
        if (!results.result) {
          return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: 'Could not upload file...'
          });
        }

        createObj.item_image_id = results.result.public_id,
        createObj.item_image_link = results.result.secure_url
      }

      console.log(`createObj`, createObj);

      const new_favor_model = await FavorsRepo.create_favor(createObj as ICreateUpdateFavor);
      console.log({new_favor_model});

      return response.status(HttpStatusCode.OK).json({
        message: `New Favor Created!`,
        data: new_favor_model
      });
    } catch (e) {
      console.log(e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: `Could not create new favor`,
        error: e
      });
    }
  }

  static async update_favor(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.fulfilled) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Favor is already fulfilled.`,
      });
    }
    if (favorObj.startd) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Favor is already started.`,
      });
    }
    if (favorObj.owner_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Not favor owner.`,
      });
    }

    const updateObj: any = {
      owner_id: you.id
    };

    for (const prop of create_update_favor_required_props) {
      if (!request.body.hasOwnProperty(prop.field)) {
        continue;
      }
      const isValid: boolean = prop.validator(request.body[prop.field]);
      if (!isValid) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }

      updateObj[prop.field] = request.body[prop.field];
    }

    const updates = await FavorsRepo.update_favor(updateObj as ICreateUpdateFavor, favor_model.get('id'));
    return response.status(HttpStatusCode.OK).json({
      message: `Favor Updated!`,
      data: updates
    });
  }

  static async delete_favor(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.fulfilled) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Favor is already fulfilled.`,
      });
    }
    if (favorObj.startd) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Favor is already started.`,
      });
    }

    const deletes = await FavorsRepo.delete_favor(favor_model.get('id'));
    return response.status(HttpStatusCode.OK).json({
      message: `Favor Deleted!`,
      data: deletes
    });
  }

  static async assign_favor(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.owner_id === you.id) {
      // if not owner, check if is helper
      return response.status(HttpStatusCode.OK).json({
        message: `Favor owner cannot be assigned as helper.`,
      });
    }

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
    if (helper) {
      return response.status(HttpStatusCode.OK).json({
        message: `Already a helper of this favor.`,
      });
    }

    if (favorObj.favor_helpers.length === favorObj.helpers_wanted) {
      return response.status(HttpStatusCode.OK).json({
        message: `Max helpers wanted reached.`,
      });
    }

    // the lead helper is sent when there are no other helpers
    const is_lead = !favorObj.favor_helpers.length

    let new_helper_model = await FavorHelpers.create({ 
      favor_id: favorObj.id, user_id: you.id, is_lead
    });
    const new_helper = await new_helper_model.get();

    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor helper assigned!`,
      new_helper,
      data,
    });
  }

  static async unassign_favor(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not a helper of this favor.`,
        });
      }
    }

    const deletes = await FavorHelpers.destroy({ 
      where: { favor_id: favorObj.id, user_id: you.id }
    });

    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor helper unassigned!`,
      deletes,
      data,
    });
  }
  
  static async mark_favor_as_started(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.datetime_started) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is already started.`,
      });
    }

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is lead helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not a helper of this favor.`,
        });
      }
  
      if (!helper.is_lead) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not lead helper of this favor.`,
        });
      }
    }

    favor_model.datetime_started = fn('NOW');
    const updates = await favor_model.save({ fields: ['datetime_started'] });
    
    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor started!`,
      data,
      updates,
    });
  }

  static async mark_favor_as_fulfilled(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.datetime_fulfilled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is already fulfilled.`,
      });
    }

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is lead helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not a helper of this favor.`,
        });
      }
  
      if (!helper.is_lead) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not lead helper of this favor.`,
        });
      }
    }

    favor_model.datetime_fulfilled = fn('NOW');
    const updates = await favor_model.save({ fields: ['datetime_fulfilled'] });
    
    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor fulfilled!`,
      data,
      updates,
    });
  }

  static async mark_favor_as_canceled(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.canceled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is already canceled.`,
      });
    }

    if (favorObj.owner_id !== you.id) {
      // if not owner, check if is lead helper
      const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === you.id);
  
      if (!helper) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not a helper of this favor.`,
        });
      }
  
      if (!helper.is_lead) {
        return response.status(HttpStatusCode.OK).json({
          message: `Not lead helper of this favor.`,
        });
      }
    }

    favor_model.canceled = true;
    favor_model.datetime_started = null;
    const updates = await favor_model.save({ fields: ['canceled', 'started'] });

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
      reason: request.body.reason || ''
    });

    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor canceled!`,
      data,
      updates,
    });
  }
  static async mark_favor_as_uncanceled(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (!favorObj.canceled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is not canceled.`,
      });
    }

    favor_model.canceled = false;
    const updates = await favor_model.save({ fields: ['canceled'] });

    return response.status(HttpStatusCode.OK).json({
      message: `Favor uncanceled!`,
      updates,
    });
  }

  static async mark_helper_as_helped(request: Request, response: Response) {
    const you = response.locals.you;
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.canceled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is canceled.`,
      });
    }
    if (favorObj.canceled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is fulfilled.`,
      });
    }

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === user_id);
    if (!helper) {
      return response.status(HttpStatusCode.OK).json({
        message: `Helper user not found by id: ${user_id}`,
      });
    }

    const updates = await FavorHelpers.update({ helped: true }, { 
      where: { favor_id: favorObj.id, user_id }
    });
    
    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor helper marked as helped!`,
      data,
      updates,
    });
  }

  static async mark_helper_as_unhelped(request: Request, response: Response) {
    const you = response.locals.you;
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    if (favorObj.canceled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is canceled.`,
      });
    }
    if (favorObj.canceled) {
      return response.status(HttpStatusCode.OK).json({
        message: `Favor is fulfilled.`,
      });
    }

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === user_id);
    if (!helper) {
      return response.status(HttpStatusCode.OK).json({
        message: `Helper user not found by id: ${user_id}`,
      });
    }

    const updates = await FavorHelpers.update({ helped: true }, { 
      where: { favor_id: favorObj.id, user_id }
    });
    
    const data = await FavorsRepo.get_favor_by_id(favorObj.id);

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

    return response.status(HttpStatusCode.OK).json({
      message: `Favor helper marked as unhelped!`,
      data,
      updates,
    });
  }

  static async get_settings(request: Request, response: Response) {
    const you = response.locals.you;

    let settings = await MyfavorsUserProfileSettings.findOne({
      where: { user_id: you.id }
    });
    if (!settings) {
      settings = await MyfavorsUserProfileSettings.create({
        user_id: you.id
      });
    }

    return response.status(HttpStatusCode.OK).json({
      data: settings
    });
  }

  static async update_settings(request: Request, response: Response) {
    const you = response.locals.you;
    const data = request.body;

    const updatesObj: any = {};

    let settings = await MyfavorsUserProfileSettings.findOne({
      where: { user_id: you.id }
    });
    if (!settings) {
      settings = await MyfavorsUserProfileSettings.create({
        user_id: you.id
      });
    }

    for (const prop of myfavors_user_settings_required_props) {
      if (!data.hasOwnProperty(prop.field)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }
      const isValid: boolean = prop.validator(data[prop.field]);
      if (!isValid) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is invalid.`
        });
      }
      updatesObj[prop.field] = data[prop.field];
    }

    const updates = await settings.update(updatesObj);

    return response.status(HttpStatusCode.OK).json({
      message: `Updated settings successfully!`,
      updates,
      data: settings,
    });
  }



  /*
  static async create_checkout_session(request: Request, response: Response) {
    const you = response.locals.you;
    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj = favor_model!.toJSON() as any;
    

    if (favorObj.owner_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the owner of this favor.`,
      });
    }

    if (!favorObj.owner.stripe_account_verified) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Owner's stripe account is not setup`,
      });
    }

    const payment_session_id = favorObj.payment_session_id;

    const host: string = request.get('origin')!;
    const useHost = host.endsWith('/') ? host.substr(0, host.length - 1) : host;
    const successUrl = `${useHost}/modern/apps/myfavors/favors/${favorObj.id}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${useHost}/modern/apps/myfavors/favors/${favorObj.id}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`;
    
    // const createPaymentOpts = {
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: {
    //           name: `Favor of ${favorObj.title} by ${getUserFullName(favorObj.carrier)}`,
    //         },
    //         unit_amount: parseFloat(favorObj.payout + '00'),
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'payment',
    //   success_url: successUrl,
    //   cancel_url: cancelUrl,
    // };

    // const session = await stripe.checkout.sessions.create(createPaymentOpts);
    
    // console.log({ createPaymentOpts }, JSON.stringify(createPaymentOpts));
    // console.log({ session });

    let paymentIntent;
    
    try {
      const chargeFeeData = StripeService.add_on_stripe_processing_fee(favorObj.payout_per_helper);
      paymentIntent = await StripeService.stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: chargeFeeData.new_total,
        currency: 'usd',
        application_fee_amount: chargeFeeData.app_fee, 
        transfer_data: {
          destination: favorObj.carrier.stripe_account_id,
        },
      },
      // { stripeAccount: you.stripe_account_id }
      );
    } catch (err) {
      console.log((<any> err).message);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: (<any> err).message,
        err
      });
    }
    

    // check if favor already has a session. if so, over-write with new one
    // await favor_model.update({ paymentIntent });

    const newIntent = await UserPaymentIntents.create({
      user_id: owner_id,
      payment_intent_id: paymentIntent.id,
      payment_intent_event: MYFAVORS_EVENT_TYPES.FAVOR_COMPLETED,
      micro_app: MODERN_APP_NAMES.MYFAVORS,
      target_type: MYFAVORS_NOTIFICATION_TARGET_TYPES.FAVOR,
      target_id: favor_id,
    });

    // console.log({ newIntent, paymentIntent });

    return response.status(HttpStatusCode.OK).json({
      message: `Payment intent created`,
      payment_client_secret: paymentIntent.client_secret,
      stripe_pk: process.env.STRIPE_PK
    });
  }
  */

  static async pay_helper(request: Request, response: Response) {
    const you = response.locals.you;
    const user = response.locals.user;

    const favor_model: IMyModel = response.locals.favor_model;
    const favorObj: any = favor_model.toJSON();

    const helper = favorObj.favor_helpers.find((helper: any) => helper.user_id === user.id);

    if (!helper) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `No helper user found by id ${user.id}`
      });
    }
    if (helper.paid) {
      return response.status(HttpStatusCode.FORBIDDEN).json({
        message: `Helper already paid`
      });
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
        amount: chargeFeeData.new_total,
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
    } catch (err) {
      console.log((<any> err).message);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: (<any> err).message,
        err
      });
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

    return response.status(HttpStatusCode.OK).json({
      message: `Payment intent created`,
      payment_client_secret: paymentIntent.client_secret,
      stripe_pk: process.env.STRIPE_PK
    });
  }
}