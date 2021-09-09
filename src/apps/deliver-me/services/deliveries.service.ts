import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { 
  allowedImages,
  populate_common_notification_obj,
  user_attrs_slim
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';
import {
  fn, Op,
} from 'sequelize';

import * as UserRepo from '../../_common/repos/users.repo';
import * as FollowsRepo from '../../_common/repos/follows.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as DeliveryRepo from '../repos/deliveries.repo';
import { create_notification } from '../../_common/repos/notifications.repo';
import { Follows, Users } from '../../_common/models/user.model';
import {
  COMMON_EVENT_TYPES,
  MODERN_APP_NAMES
} from '../../_common/enums/common.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import {
  Delivery,
  DeliveryTrackingUpdates
} from '../models/delivery.model';
import { IMyModel } from '../../_common/models/common.model-types';
import {
  create_delivery_required_props,
  create_delivery_tracking_update_required_props,
  deliveryme_user_settings_required_props,
  populate_deliverme_notification_obj
} from '../deliverme.chamber';
import {
  ICreateDeliveryProps,
  ICreateDeliveryTrackingUpdateProps
} from '../interfaces/deliverme.interface';
import { UploadedFile } from 'express-fileupload';
import { store_image } from '../../../cloudinary-manager';
import {
  DELIVERME_EVENT_TYPES,
  DELIVERME_NOTIFICATION_TARGET_TYPES
} from '../enums/deliverme.enum';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';
import { DeliverMeUserProfileSettings } from '../models/deliverme.model';

export class DeliveriesService {

  static async find_available_delivery_by_from_city_and_state(request: Request, response: Response) {
    const city: string = request.params.city;
    const state: string = request.params.state;

    const result = await Delivery.findOne({
      where: {
        carrier_id: null,
        completed: false,
        from_city: city,
        from_state: state,
      },
      order: [fn('RANDOM')],
      include: DeliveryRepo.deliveryMasterIncludes,
    });

    return response.status(HttpStatusCode.OK).json({
      data: result
    });
  }

  static async find_available_delivery_by_to_city_and_state(request: Request, response: Response) {
    const city: string = request.params.city;
    const state: string = request.params.state;

    const result = await Delivery.findOne({
      where: {
        carrier_id: null,
        completed: false,
        to_city: city,
        to_state: state,
      },
      order: [fn('RANDOM')],
      include: DeliveryRepo.deliveryMasterIncludes
    });

    return response.status(HttpStatusCode.OK).json({
      data: result
    });
  }

  static async find_available_delivery(request: Request, response: Response) {
    try {
      const you = response.locals.you;
      const searchCriterias = [
        { label: 'From City', value: 'from-city' },
        { label: 'To City', value: 'to-city' },
      
        { label: 'From State', value: 'from-state' },
        { label: 'To State', value: 'to-state' },
      
        { label: 'From City in State', value: 'from-city-state' },
        { label: 'To City in State', value: 'to-city-state' },
      
        // { label: 'County in State', value: 'county-state' },
      ];
      const useWhere: any = {};
      
      switch (request.body.criteria) {
        case searchCriterias[0].value: {
          // from city
          useWhere.from_city = request.body.city;
          break;
        }
        case searchCriterias[1].value: {
          // to city
          useWhere.to_city = request.body.city;
          break;
        }

        case searchCriterias[2].value: {
          // from state
          useWhere.from_state = request.body.state;
          break;
        }
        case searchCriterias[3].value: {
          // to state
          useWhere.to_state = request.body.state;
          break;
        }

        case searchCriterias[4].value: {
          // from city-state
          useWhere.from_city = request.body.city;
          useWhere.from_state = request.body.state;
          break;
        }
        case searchCriterias[5].value: {
          // to city-state
          useWhere.to_city = request.body.city;
          useWhere.to_state = request.body.state;
          break;
        }

        default: {
          return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            message: `Unknown/Invalid criteria: ${request.body.criteria}`,
          });
        }
      }

      const result = await Delivery.findOne({
        where: {
          owner_id: {
            [Op.ne]: you.id
          },
          carrier_id: null,
          completed: false,
          ...useWhere
        },
        order: [fn('RANDOM')],
        include: DeliveryRepo.deliveryMasterIncludes
      });
  
      return response.status(HttpStatusCode.OK).json({
        data: result
      });
    } catch (e) {
      console.log(e);
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: `Could not find available delivery...`,
        error: e
      });
    }
  }

  static async get_delivery_by_id(request: Request, response: Response) {
    const delivery = response.locals.delivery_model.toJSON();
    return response.status(HttpStatusCode.OK).json({
      data: delivery
    });
  }
  
  static async get_user_deliveries_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const results = await CommonRepo.getAll(
      Delivery,
      'owner_id',
      user_id,
      DeliveryRepo.deliveryMasterIncludes,
      undefined, undefined, undefined,
      DeliveryRepo.deliveryTrackingOrderBy
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliveries(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const delivery_id: number = parseInt(request.params.delivery_id, 10);
    const results = await CommonRepo.paginateTable(
      Delivery,
      'owner_id',
      user_id,
      delivery_id,
      DeliveryRepo.deliveryMasterIncludes,
      undefined,
      undefined,
      undefined,
      DeliveryRepo.deliveryTrackingOrderBy
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliverings_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const results = await CommonRepo.getAll(
      Delivery,
      'carrier_id',
      user_id,
      DeliveryRepo.deliveryMasterIncludes,
      undefined,
      undefined,
      {
        completed: false
      },
      DeliveryRepo.deliveryTrackingOrderBy
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliverings(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const delivery_id: number = parseInt(request.params.delivery_id, 10);

    const results = await CommonRepo.paginateTable(
      Delivery,
      'carrier_id',
      user_id,
      delivery_id,
      DeliveryRepo.deliveryMasterIncludes,
      undefined,
      undefined,
      {
        completed: false
      },
      DeliveryRepo.deliveryTrackingOrderBy
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_delivering(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    const result = await Delivery.findOne({
      where: {
        carrier_id: you_id,
        completed: false
      },
      include: DeliveryRepo.deliveryMasterIncludes,
      order: DeliveryRepo.deliveryTrackingOrderBy
    });
    return response.status(HttpStatusCode.OK).json({
      data: result
    });
  }

  static async create_delivery(request: Request, response: Response) {
    try {
      const you = response.locals.you;
      const createObj: PlainObject = {
        owner_id: you.id
      };

      const data: PlainObject = JSON.parse(request.body.payload);
      const delivery_image: UploadedFile | undefined = request.files && (<UploadedFile> request.files.delivery_image);

      console.log(`request.body`, request.body);
      console.log(`data`, data);

      for (const prop of create_delivery_required_props) {
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

      if (delivery_image) {
        const type = delivery_image.mimetype.split('/')[1];
        const isInvalidType = !allowedImages.includes(type);
        if (isInvalidType) {
          return response.status(HttpStatusCode.BAD_REQUEST).json({
            error: true,
            message: 'Invalid file type: jpg, jpeg or png required...'
          });
        }

        const results = await store_image(delivery_image);
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

      const new_delivery_model = await DeliveryRepo.create_delivery(createObj as ICreateDeliveryProps);
      return response.status(HttpStatusCode.OK).json({
        message: `New Delivery Created!`,
        data: new_delivery_model
      });
    } catch (e) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: `Could not create new delivery`,
        error: e
      });
    }
  }

  static async update_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model = response.locals.delivery_model;
    const updateObj: PlainObject = {
      owner_id: you.id
    };

    for (const prop of create_delivery_required_props) {
      if (!request.body.hasOwnProperty(prop.field)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }
      const isValid: boolean = prop.validator(request.body[prop.field]);
      if (!isValid) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `${prop.name} is required.`
        });
      }

      updateObj[prop.field] = request.body[prop.field];
    }

    const updates = await DeliveryRepo.update_delivery(delivery_model.get('id'), updateObj as ICreateDeliveryProps);
    return response.status(HttpStatusCode.OK).json({
      message: `Delivery Updated!`,
      data: updates
    });
  }

  static async delete_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model = response.locals.delivery_model;

    const deletes = await DeliveryRepo.delete_delivery(delivery_model.get('id'));
    return response.status(HttpStatusCode.OK).json({
      message: `Delivery Deleted!`,
      data: deletes
    });
  }

  static async assign_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    
    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (!!carrier_id && carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Delivery already has carrier assigned.`,
      });
    }

    delivery_model.carrier_id = you.id;
    delivery_model.carrier_assigned_date = fn('NOW');
    const updates = await delivery_model.save({ fields: ['carrier_id', 'carrier_assigned_date'] });

    const data = await DeliveryRepo.get_delivery_by_id(delivery_model.get('id'));

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.CARRIER_ASSIGNED,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_model.get('id')
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.CARRIER_ASSIGNED,
        data: {
          data,
          message: `Delivery assigned to user!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery assigned to user!`,
      data,
      updates,
    });
  }

  static async unassign_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the carrier of this delivery.`,
      });
    }

    delivery_model.carrier_id = null;
    delivery_model.carrier_assigned_date = null;
    const updates = await delivery_model.save({ fields: ['carrier_id', 'carrier_assigned_date'] });
    
    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

    const trackingDeletes = await DeliveryTrackingUpdates.destroy({ 
      where: { delivery_id }
    });

    console.log({ trackingDeletes });

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.CARRIER_UNASSIGNED,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.CARRIER_UNASSIGNED,
        data: {
          data,
          message: `Delivery unassigned by carrier!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery unassigned by carrier!`,
      data,
      updates,
    });
  }

  static async create_tracking_update(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the carrier of this delivery.`,
      });
    }

    const createObj: any = {
      user_id: you.id,
      delivery_id,
    };

    const data: PlainObject = JSON.parse(request.body.payload);
    const tracking_update_image: UploadedFile | undefined = request.files && (
      <UploadedFile> request.files.tracking_update_image
    );

    console.log(`request.body`, request.body);
    console.log(`data`, data);
    
    for (const prop of create_delivery_tracking_update_required_props) {
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
    if (tracking_update_image) {
      const type = tracking_update_image.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }
      const results = await store_image(tracking_update_image);
      if (!results.result) {
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Could not upload file...'
        });
      }
      createObj.icon_id = results.result.public_id,
      createObj.icon_link = results.result.secure_url
    }

    console.log(`createObj`, createObj);
    const new_delivery_tracking_update_model = await DeliveryRepo.create_delivery_tracking_update(createObj as ICreateDeliveryTrackingUpdateProps);

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_TRACKING_UPDATE,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY_TRACKING_UPDATE,
      target_id: new_delivery_tracking_update_model.get('id') as number
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_TRACKING_UPDATE,
        data: {
          data: new_delivery_tracking_update_model,
          message: `Delivery new tracking update!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery new tracking update!`,
      data: new_delivery_tracking_update_model,
    });
  }

  static async add_delivered_picture(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the carrier of this delivery.`,
      });
    }
    if (!delivery_model.get('datetime_delivered')) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Delivery is not delivered yet.`,
      });
    }

    const delivered_image: UploadedFile | undefined = request.files && (<UploadedFile> request.files.delivered_image);
    if (!delivered_image) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `'delivered_image' not found in form.`,
      });
    }

    const type = delivered_image.mimetype.split('/')[1];
    const isInvalidType = !allowedImages.includes(type);
    if (isInvalidType) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        error: true,
        message: 'Invalid file type: jpg, jpeg or png required...'
      });
    }
    const results = await store_image(delivered_image);
    if (!results.result) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Could not upload file...'
      });
    }

    delivery_model.delivered_image_id = results.result.public_id;
    delivery_model.delivered_image_link = results.result.secure_url;
    const updates = await delivery_model.save({ fields: ['delivered_image_id', 'delivered_image_link'] });

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.DELIVERY_ADD_COMPLETED_PICTURE,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.DELIVERY_ADD_COMPLETED_PICTURE,
        data: {
          data: updates,
          message: `Delivery added delivered picture!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery added delivered picture!`,
      data: updates,
    });
  }

  static async mark_delivery_as_picked_up(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the carrier of this delivery.`,
      });
    }

    delivery_model.datetime_picked_up = fn('NOW');
    const updates = await delivery_model.save({ fields: ['datetime_picked_up'] });
    
    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.CARRIER_MARKED_AS_PICKED_UP,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.CARRIER_MARKED_AS_PICKED_UP,
        data: {
          data,
          message: `Delivery picked up by carrier!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery picked up by carrier!`,
      data,
      updates,
    });
  }

  static async mark_delivery_as_dropped_off(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the carrier of this delivery.`,
      });
    }

    delivery_model.datetime_delivered = fn('NOW');
    const updates = await delivery_model.save({ fields: ['datetime_delivered'] });
    
    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.CARRIER_MARKED_AS_DROPPED_OFF,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.CARRIER_MARKED_AS_DROPPED_OFF,
        data: {
          data,
          message: `Delivery dropped off by carrier!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery dropped off by carrier!`,
      data,
      updates,
    });
  }

  static async mark_delivery_as_completed(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (owner_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the owner of this delivery.`,
      });
    }

    delivery_model.completed = true;
    const updates = await delivery_model.save({ fields: ['completed'] });
    
    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

    create_notification({
      from_id: you.id,
      to_id: carrier_id,
      event: DELIVERME_EVENT_TYPES.DELIVERY_COMPLETED,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: carrier_id,
        event: DELIVERME_EVENT_TYPES.DELIVERY_COMPLETED,
        data: {
          data,
          message: `Delivery completed!`,
          user: you,
          notification,
        }
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery completed!`,
      data,
      updates,
    });
  }

  static async get_settings(request: Request, response: Response) {
    const you = response.locals.you;

    let settings = await DeliverMeUserProfileSettings.findOne({
      where: { user_id: you.id }
    });
    if (!settings) {
      settings = await DeliverMeUserProfileSettings.create({
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

    let settings = await DeliverMeUserProfileSettings.findOne({
      where: { user_id: you.id }
    });
    if (!settings) {
      settings = await DeliverMeUserProfileSettings.create({
        user_id: you.id
      });
    }

    for (const prop of deliveryme_user_settings_required_props) {
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
      data: settings,
    });
  }
}