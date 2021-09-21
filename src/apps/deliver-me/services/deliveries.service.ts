import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { 
  allowedImages,
  getUserFullName,
  populate_common_notification_obj,
  user_attrs_slim,
  validatePhone
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
  IRequest
} from '../../_common/interfaces/common.interface';
import {
  fn, Op,
} from 'sequelize';
import {
  get as http_get
} from 'http';
import {
  get as https_get
} from 'https';
import * as UserRepo from '../../_common/repos/users.repo';
import * as FollowsRepo from '../../_common/repos/follows.repo';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as DeliveryRepo from '../repos/deliveries.repo';
import { create_notification } from '../../_common/repos/notifications.repo';
import { Follows, UserPaymentIntents, Users } from '../../_common/models/user.model';
import {
  COMMON_EVENT_TYPES,
  MODERN_APP_NAMES
} from '../../_common/enums/common.enum';
import { SocketsService } from '../../_common/services/sockets.service';
import {
  Delivery,
  DeliveryMessages,
  DeliveryTrackingUpdates
} from '../models/delivery.model';
import { IMyModel } from '../../_common/models/common.model-types';
import {
  create_delivery_required_props,
  create_delivery_tracking_update_required_props,
  deliveryme_user_settings_required_props,
  delivery_search_attrs,
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
import { send_sms } from '../../../sms-client';
import { GoogleService } from '../../_common/services/google.service';
import { StripeService } from '../../_common/services/stripe.service';

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

  static async search_deliveries(request: Request, response: Response) {
    const you = response.locals.you;
    const {
      from_city,
      from_state,
      to_city,
      to_state,
    } = request.body;

    const fromValid = from_city && from_state;
    const toValid = to_city && to_state;
    const fromAndToValid = fromValid && toValid;

    if (!fromValid && !toValid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `from location and to location were invalid`
      });
    }

    if (fromValid && !toValid) {
      const results = await Delivery.findAll({
        where: { from_city, from_state, completed: false, carrier_id: null, owner_id: { [Op.ne]: you.id } },
        attributes: delivery_search_attrs,
        limit: 5,
        order: [fn('RANDOM')]
      });
      return response.status(HttpStatusCode.OK).json({
        data: results
      });
    }
    if (!fromValid && toValid) {
      const results = await Delivery.findAll({
        where: { to_city, to_state, completed: false, carrier_id: null, owner_id: { [Op.ne]: you.id } },
        attributes: delivery_search_attrs,
        limit: 5,
        order: [fn('RANDOM')]
      });
      return response.status(HttpStatusCode.OK).json({
        data: results
      });
    }
    if (fromAndToValid) {
      const results = await Delivery.findAll({
        where: { from_city, from_state, to_city, to_state, completed: false, carrier_id: null, owner_id: { [Op.ne]: you.id } },
        attributes: delivery_search_attrs,
        limit: 5,
        order: [fn('RANDOM')]
      });
      return response.status(HttpStatusCode.OK).json({
        data: results
      });
    }

    return response.status(HttpStatusCode.BAD_GATEWAY).json({
      message: `unhandled contition...`,
      fromValid, 
      toValid,
      fromAndToValid
    });
  }

  static async send_delivery_message(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;
    
    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (you.id !== owner_id && you.id !== carrier_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `User is not involved with this delivery`
      });
    }

    const body = request.body.body;
    if (!body || !body.trim()) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Body cannot be empty`
      });
    }

    // create the new message
    const new_message_model = await DeliveryMessages.create({
      body,
      delivery_id,
      user_id: you.id
    });

    const new_message = await DeliveryMessages.findOne({
      where: { id: new_message_model.get('id') },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    const to_id = you.id === owner_id ? carrier_id : owner_id;

    create_notification({
      from_id: you.id,
      to_id: to_id,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_MESSAGE,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);

      const eventData = {
        event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_MESSAGE,
        message: `New delivery message for: ${delivery_model.get('title')}`,
        micro_app: MODERN_APP_NAMES.DELIVERME,
        data: new_message!.toJSON() as any,
        user_id: you.id,
        notification,
      }
      const TO_ROOM = `${DELIVERME_EVENT_TYPES.TO_DELIVERY}:${delivery_id}`;
      // console.log({ TO_ROOM, eventData });
      (<IRequest> request).io.to(TO_ROOM).emit(TO_ROOM, eventData);
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: to_id,
        event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_MESSAGE,
        data: eventData
      });
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery message sent successfully!`,
      data: new_message,
    });
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
      undefined,
      undefined,
      undefined,
      DeliveryRepo.deliveryTrackingOrderBy
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliveries(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const delivery_id: number | undefined = request.params.delivery_id ? parseInt(request.params.delivery_id, 10) : undefined;
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
      { completed: true },
      DeliveryRepo.deliveryTrackingOrderBy
    );
    return response.status(HttpStatusCode.OK).json({
      data: results
    });
  }

  static async get_user_deliverings(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const delivery_id: number | undefined = request.params.delivery_id ? parseInt(request.params.delivery_id, 10) : undefined;

    console.log({ user_id, delivery_id, carrier: true });

    const results = await CommonRepo.paginateTable(
      Delivery,
      'carrier_id',
      user_id,
      delivery_id,
      DeliveryRepo.deliveryMasterIncludes,
      undefined,
      undefined,
      { completed: true },
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

    if (!!delivery_model.get('carrier_id')) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Delivery is in progress.`,
      });
    }

    const deletes = await DeliveryRepo.delete_delivery(delivery_model.get('id'));
    return response.status(HttpStatusCode.OK).json({
      message: `Delivery Deleted!`,
      data: deletes
    });
  }

  static async assign_delivery(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;
    
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
    delivery_model.returned = false;
    const updates = await delivery_model.save({ fields: ['carrier_id', 'carrier_assigned_date', 'returned'] });

    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

    create_notification({
      from_id: you.id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.CARRIER_ASSIGNED,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
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

      const to_phone_number = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
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
    const deliveryObj = delivery_model!.toJSON() as any;

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
    delivery_model.datetime_picked_up = null;
    const updates = await delivery_model.save({ fields: ['carrier_id', 'carrier_assigned_date', 'datetime_picked_up'] });
    
    const trackingDeletes = await DeliveryTrackingUpdates.destroy({ 
      where: { delivery_id }
    });
    const messagesDeletes = await DeliveryMessages.destroy({ 
      where: { delivery_id }
    });

    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

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

      const to_phone_number = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
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
    const deliveryObj = delivery_model!.toJSON() as any;

    // console.log({ deliveryObj });

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

    // console.log(`request.body`, request.body);
    // console.log(`data`, data);
    
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

    // console.log(`createObj`, createObj);
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

      const owner_phone = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(owner_phone)) {
        GoogleService.getLocationFromCoordinates(createObj.carrier_lat, createObj.carrier_lng)
          .then((placeData) => {
            const msg = `ModernApps ${MODERN_APP_NAMES.DELIVERME} - Delivery: new tracking update for delivery "${deliveryObj.title}"\n\n` +
            `${createObj.message}\n\n` +
            `Carrier's Location: ${placeData.city}, ${placeData.state} ` +
              `${placeData.county ? '(' + placeData.county + ')' : ''} ${placeData.zipcode}`;
            console.log(`sending:`, msg);
            
            send_sms({
              to_phone_number: owner_phone,
              message: msg,
            })
          })
          .catch((error) => {
            console.log(`Can't send sms with location; sending without...`);
            const msg = `ModernApps ${MODERN_APP_NAMES.DELIVERME} - Delivery: new tracking update for delivery "${deliveryObj.title}"\n\n` +
            `${createObj.message}`;
            console.log(`sending:`, msg);
            
            send_sms({
              to_phone_number: owner_phone,
              message: msg,
            })
          });
      }
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery new tracking update!`,
      data: new_delivery_tracking_update_model,
    });
  }

  static async add_delivered_picture(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;

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

      const to_phone_number = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery added delivered picture!`,
      data: updates,
    });
  }

  static async mark_delivery_as_picked_up(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;

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

      const to_phone_number = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
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
    const deliveryObj = delivery_model!.toJSON() as any;

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

      const to_phone_number = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
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
    const deliveryObj = delivery_model!.toJSON() as any;

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

      const to_phone_number = deliveryObj.carrier.deliverme_settings.phone || deliveryObj.carrier.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery completed!`,
      data,
      updates,
    });
  }

  static async mark_delivery_as_returned(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (carrier_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the carrier of this delivery.`,
      });
    }

    delivery_model.returned = true;
    delivery_model.carrier_id = null;
    delivery_model.carrier_assigned_date = null;
    delivery_model.datetime_picked_up = null;

    const updates = await delivery_model.save({ fields: ['returned', 'carrier_id', 'carrier_assigned_date', 'datetime_picked_up'] });
    
    const trackingDeletes = await DeliveryTrackingUpdates.destroy({ 
      where: { delivery_id }
    });
    const messagesDeletes = await DeliveryMessages.destroy({ 
      where: { delivery_id }
    });

    const data = await DeliveryRepo.get_delivery_by_id(delivery_id);

    create_notification({
      from_id: carrier_id,
      to_id: owner_id,
      event: DELIVERME_EVENT_TYPES.DELIVERY_RETURNED,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id
    }).then(async (notification_model) => {
      const notification = await populate_deliverme_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: DELIVERME_EVENT_TYPES.DELIVERY_RETURNED,
        data: {
          event: DELIVERME_EVENT_TYPES.DELIVERY_RETURNED,
          micro_app: MODERN_APP_NAMES.DELIVERME,
          data,
          message: `Delivery returned`,
          user: you,
          notification,
        }
      });

      const to_phone_number = deliveryObj.owner.deliverme_settings.phone || deliveryObj.owner.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Delivery returned`,
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

  static async create_checkout_session(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    if (owner_id !== you.id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `You are not the owner of this delivery.`,
      });
    }

    if (deliveryObj.completed) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Delivery is already completed`,
      });
    }

    if (!deliveryObj.owner.stripe_account_verified) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Owner's stripe account is not setup`,
      });
    }

    if (!deliveryObj.carrier.stripe_account_verified) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Carrier's stripe account is not setup`,
      });
    }

    await delivery_model.update({ payment_session_id: '' });

    const host: string = request.get('origin')!;
    const useHost = host.endsWith('/') ? host.substr(0, host.length - 1) : host;
    const successUrl = `${useHost}/modern/apps/deliverme/deliveries/${delivery_id}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${useHost}/modern/apps/deliverme/deliveries/${delivery_id}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`;
    
    // const createPaymentOpts = {
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: {
    //           name: `Delivery of ${deliveryObj.title} by ${getUserFullName(deliveryObj.carrier)}`,
    //         },
    //         unit_amount: parseFloat(deliveryObj.payout + '00'),
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
      paymentIntent = await StripeService.stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: parseFloat(deliveryObj.payout + '00'),
        currency: 'usd',
        application_fee_amount: 0, // free, for now
        transfer_data: {
          destination: deliveryObj.carrier.stripe_account_id,
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
    

    // check if delivery already has a session. if so, over-write with new one
    // await delivery_model.update({ paymentIntent });

    const newIntent = await UserPaymentIntents.create({
      user_id: owner_id,
      payment_intent_id: paymentIntent.id,
      payment_intent_event: DELIVERME_EVENT_TYPES.DELIVERY_COMPLETED,
      micro_app: MODERN_APP_NAMES.DELIVERME,
      target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY,
      target_id: delivery_id,
    });

    // console.log({ newIntent, paymentIntent });

    return response.status(HttpStatusCode.OK).json({
      message: `Payment intent created`,
      payment_client_secret: paymentIntent.client_secret,
      stripe_pk: process.env.STRIPE_PK
    });
  }

  static async payment_success(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    const session_id = request.query.session_id;
    if (!session_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Payment session_id was not added as query param on request`,
      });
    }

    if (session_id !== deliveryObj.payment_session_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Payment session_id does not match with delivery`,
      });
    }

    // pay carrier



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

      const to_phone_number = deliveryObj.carrier.deliverme_settings.phone || deliveryObj.carrier.phone;
      if (validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Payment session completed`,
    });
  }

  static async payment_cancel(request: Request, response: Response) {
    const you = response.locals.you;
    const delivery_model: IMyModel = response.locals.delivery_model;
    const deliveryObj = delivery_model!.toJSON() as any;

    const delivery_id = delivery_model.get('id');
    const owner_id = delivery_model.get('owner_id');
    const carrier_id = delivery_model.get('carrier_id');

    const session_id = request.query.session_id;
    if (!session_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Payment session_id was not added as query param on request`,
      });
    }

    if (session_id !== deliveryObj.payment_session_id) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Payment session_id does not match with delivery`,
      });
    }

    await delivery_model.update({ payment_session_id: '' });

    return response.status(HttpStatusCode.OK).json({
      message: `Payment session canceled`,
    });
  }
}