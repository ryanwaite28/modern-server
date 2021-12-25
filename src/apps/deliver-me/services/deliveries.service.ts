import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import { 
  user_attrs_slim,
  validateAndUploadImageFile,
  validateData,
  validatePhone
} from '../../_common/common.chamber';
import {
  PlainObject,
  IUser,
} from '../../_common/interfaces/common.interface';
import {
  fn,
} from 'sequelize';
import {
  paginateTable,
  getAll
} from '../../_common/repos/_common.repo';
import {
  deliveryMasterIncludes,
  find_available_delivery_by_to_city_and_state,
  find_available_delivery_by_from_city_and_state,
  find_available_delivery,
  search_deliveries,
  browse_recent_deliveries,
  browse_featured_deliveries,
  browse_map_deliveries,
  get_delivery_by_id,
  deliveryOrderBy,
  create_delivery,
  delete_delivery,
  create_delivery_tracking_update,
  create_delivery_message,
  update_delivery,
} from '../repos/deliveries.repo';
import { create_notification } from '../../_common/repos/notifications.repo';
import { UserPaymentIntents, Users } from '../../_common/models/user.model';
import {
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
  ICreateDeliveryTrackingUpdateProps,
  IDelivery
} from '../interfaces/deliverme.interface';
import { UploadedFile } from 'express-fileupload';
import {
  DELIVERME_EVENT_TYPES,
  DELIVERME_NOTIFICATION_TARGET_TYPES
} from '../enums/deliverme.enum';
import { CommonSocketEventsHandler } from '../../_common/services/socket-events-handlers-by-app/common.socket-event-handler';
import { DeliverMeUserProfileSettings } from '../models/deliverme.model';
import { send_sms } from '../../../sms-client';
import { GoogleService } from '../../_common/services/google.service';
import { StripeService } from '../../_common/services/stripe.service';
import { ServiceMethodResults } from '../../_common/types/common.types';



export class DeliveriesService {
  static async find_available_delivery_by_from_city_and_state(city: string, state: string) {
    const result = await find_available_delivery_by_from_city_and_state(city, state);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      }
    };
    return serviceMethodResults;
  }

  static async find_available_delivery_by_to_city_and_state(city: string, state: string) {
    const result = await find_available_delivery_by_to_city_and_state(city, state);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      }
    };
    return serviceMethodResults;
  }

  static async find_available_delivery(opts: {
    you: IUser,
    criteria: string,
    city: string,
    state: string,
  }) {
    try {
      const { you, criteria, city, state } = opts;
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
      
      switch (criteria) {
        case searchCriterias[0].value: {
          // from city
          useWhere.from_city = city;
          break;
        }
        case searchCriterias[1].value: {
          // to city
          useWhere.to_city = city;
          break;
        }

        case searchCriterias[2].value: {
          // from state
          useWhere.from_state = state;
          break;
        }
        case searchCriterias[3].value: {
          // to state
          useWhere.to_state = state;
          break;
        }

        case searchCriterias[4].value: {
          // from city-state
          useWhere.from_city = city;
          useWhere.from_state = state;
          break;
        }
        case searchCriterias[5].value: {
          // to city-state
          useWhere.to_city = city;
          useWhere.to_state = state;
          break;
        }

        default: {
          const serviceMethodResults: ServiceMethodResults = {
            status: HttpStatusCode.BAD_REQUEST,
            error: true,
            info: {
              message: `Unknown/Invalid criteria: ${criteria}`,
            }
          };
          return serviceMethodResults;
        }
      }

      const result = await find_available_delivery({
        you_id: you.id,
        where: useWhere
      });

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: result
        }
      };
      return serviceMethodResults;
    } 
    catch (e) {
      console.log(e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Could not find available delivery...`,
          data: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async search_deliveries(opts: {
    you: IUser,
    from_city: string,
    from_state: string,
    to_city: string,
    to_state: string,
  }) {
    const results = await search_deliveries(opts);
    let serviceMethodResults: ServiceMethodResults;

    if (results) {
      serviceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: results,
        }
      };
    }
    else {
      serviceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Could not parse search query.`,
        }
      };
    }
    
    return serviceMethodResults;
  }

  static async browse_recent_deliveries(params: {
    you: IUser,
    delivery_id?: number,
  }) {
    const deliveries = await browse_recent_deliveries(params.you, params.delivery_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deliveries,
      }
    };
    return serviceMethodResults;
  }

  static async browse_featured_deliveries(params: {
    you: IUser,
    delivery_id?: number,
  }) {
    const deliveries = await browse_featured_deliveries(params.you, params.delivery_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deliveries,
      }
    };
    return serviceMethodResults;
  }

  static async browse_map_deliveries(params: {
    you: IUser,
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

    if (!params.you) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `User data not given.`,
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

    const deliveries = await browse_map_deliveries(params);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deliveries,
      }
    };
    return serviceMethodResults;
  }

  static async send_delivery_message(opts: {
    you: IUser,
    delivery: IDelivery,
    body: string,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, body, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (you.id !== owner_id && you.id !== carrier_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `User is not involved with this delivery`
        }
      };
      return serviceMethodResults;
    }

    if (!body || !body.trim()) {
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
    const new_message = await create_delivery_message({
      body,
      delivery_id,
      user_id: you.id
    });

    if (!ignoreNotification) {
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
          message: `New delivery message for: ${delivery.title}`,
          micro_app: MODERN_APP_NAMES.DELIVERME,
          data: new_message,
          user_id: you.id,
          notification,
        }
        const TO_ROOM = `${DELIVERME_EVENT_TYPES.TO_DELIVERY}:${delivery_id}`;
        // console.log({ TO_ROOM, eventData });
        SocketsService.get_io().to(TO_ROOM).emit(TO_ROOM, eventData);
        
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: to_id,
          event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_MESSAGE,
          data: eventData
        });
      });
    }
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: new_message,
      }
    };
    return serviceMethodResults;
  }

  static async get_delivery_by_id(id: number) {
    const delivery = await get_delivery_by_id(id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: delivery,
      }
    };
    return serviceMethodResults;
  }
  
  static async get_user_deliveries_all(user_id: number) {
    const resultsList = await getAll(
      Delivery,
      'owner_id',
      user_id,
      deliveryMasterIncludes,
      undefined,
      undefined,
      undefined,
      deliveryOrderBy
    );
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_deliveries(user_id: number, delivery_id?: number) {
    const resultsList = await paginateTable(
      Delivery,
      'owner_id',
      user_id,
      delivery_id,
      deliveryMasterIncludes,
      undefined,
      undefined,
      undefined,
      deliveryOrderBy
    );
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_deliverings_all(user_id: number) {
    const resultsList = await getAll(
      Delivery,
      'carrier_id',
      user_id,
      deliveryMasterIncludes,
      undefined,
      undefined,
      { completed: true },
      deliveryOrderBy
    );
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_deliverings(user_id: number, delivery_id?: number) {
    const resultsList = await paginateTable(
      Delivery,
      'carrier_id',
      user_id,
      delivery_id,
      deliveryMasterIncludes,
      undefined,
      undefined,
      { completed: true },
      deliveryOrderBy
    );
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_delivering(you_id: number) {
    const resultsList = await Delivery.findAll({
      where: {
        carrier_id: you_id,
        completed: false
      },
      include: deliveryMasterIncludes,
      order: deliveryOrderBy
    });
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async create_delivery(opts: {
    you: IUser,
    data: any,
    delivery_image?: UploadedFile
  }) {
    try {
      const { you, data, delivery_image } = opts;
      const createObj: PlainObject = {
        owner_id: you.id
      };

      const dataValidation = validateData({
        data,
        validators: create_delivery_required_props,
        mutateObj: createObj
      });
      if (dataValidation.error) {
        return dataValidation;
      }

      const imageValidation = await validateAndUploadImageFile(delivery_image, {
        treatNotFoundAsError: false,
        mutateObj: createObj,
        id_prop: 'item_image_id',
        link_prop: 'item_image_link',
      });
      if (imageValidation.error) {
        return imageValidation;
      }

      console.log(`createObj`, createObj);

      const new_delivery_model = await create_delivery(createObj as ICreateDeliveryProps);

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `New Delivery Created!`,
          data: new_delivery_model
        }
      };
      return serviceMethodResults;
    } catch (e) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: `Could not create new delivery`,
          error: e,
        }
      };
      return serviceMethodResults;
    }
  }

  static async update_delivery(opts: {
    delivery_id: number,
    data: any
  }) {
    const { delivery_id, data } = opts;

    const updateObj: PlainObject = {};
    const dataValidation = validateData({
      data,
      validators: create_delivery_required_props,
      mutateObj: updateObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_delivery(delivery_id, updateObj);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery Updated!`,
        data: updates
      }
    };
    return serviceMethodResults;
  }

  static async delete_delivery(delivery: IDelivery) {
    // const delivery_model = await get_delivery_by_id(delivery_id);

    if (!delivery) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.NOT_FOUND,
        error: true,
        info: {
          message: `Delivery not found`,
        }
      };
      return serviceMethodResults;
    }

    if (!!delivery.carrier_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery is in progress`,
        }
      };
      return serviceMethodResults;
    }

    const deletes = await delete_delivery(delivery.id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery Deleted!`,
        data: deletes
      }
    };
    return serviceMethodResults;
  }

  static async assign_delivery(opts: {
    you: IUser,
    delivery: IDelivery,
    ignoreNotification?: boolean
  }) {
    const { you, delivery, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (!!carrier_id && carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery already has carrier assigned.`,
        }
      };
      return serviceMethodResults;
    }

    const updatesobj: PlainObject = {};
    updatesobj.carrier_id = you.id;
    updatesobj.carrier_assigned_date = fn('NOW');
    updatesobj.returned = false;
    const updates = await update_delivery(delivery_id, updatesobj);

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery assigned to user!`,
            user: you,
            notification,
          }
        });

        const to_phone_number = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery assigned to user!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async unassign_delivery(opts: {
    you: IUser,
    delivery: IDelivery,
    ignoreNotification?: boolean
  }) {
    const { you, delivery, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the carrier of this delivery.`,
        }
      };
      return serviceMethodResults;
    }
    
    const updatesobj: PlainObject = {};
    updatesobj.carrier_id = null;
    updatesobj.carrier_assigned_date = null;
    updatesobj.datetime_picked_up = null;
    const updates = await update_delivery(delivery_id, updatesobj);
    
    const trackingDeletes = await DeliveryTrackingUpdates.destroy({ 
      where: { delivery_id }
    });
    const messagesDeletes = await DeliveryMessages.destroy({ 
      where: { delivery_id }
    });

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery unassigned by carrier!`,
            user: you,
            notification,
          }
        });

        const to_phone_number = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery unassigned by carrier!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async create_tracking_update(opts: {
    you: IUser,
    delivery: IDelivery,
    data: any,
    tracking_update_image?: UploadedFile,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, data, tracking_update_image, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the carrier of this delivery.`,
        }
      };
      return serviceMethodResults;
    }

    const createObj: any = {
      user_id: you.id,
      delivery_id,
    };

    const dataValidation = validateData({
      data, 
      validators: create_delivery_tracking_update_required_props,
      mutateObj: createObj
    });
    if (dataValidation.error) {
      return dataValidation;
    }

    const imageValidation = await validateAndUploadImageFile(tracking_update_image, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: 'icon_id',
      link_prop: 'icon_link',
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const new_delivery_tracking_update = await create_delivery_tracking_update(createObj as ICreateDeliveryTrackingUpdateProps);

    if (!ignoreNotification) {
      create_notification({
        from_id: you.id,
        to_id: owner_id,
        event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_TRACKING_UPDATE,
        micro_app: MODERN_APP_NAMES.DELIVERME,
        target_type: DELIVERME_NOTIFICATION_TARGET_TYPES.DELIVERY_TRACKING_UPDATE,
        target_id: new_delivery_tracking_update.id
      }).then(async (notification_model) => {
        const notification = await populate_deliverme_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: owner_id,
          event: DELIVERME_EVENT_TYPES.DELIVERY_NEW_TRACKING_UPDATE,
          data: {
            data: new_delivery_tracking_update,
            message: `Delivery new tracking update!`,
            user: you,
            notification,
          }
        });
  
        const owner_phone = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!owner_phone && validatePhone(owner_phone)) {
          GoogleService.getLocationFromCoordinates(createObj.carrier_lat, createObj.carrier_lng)
            .then((placeData) => {
              const msg = `ModernApps ${MODERN_APP_NAMES.DELIVERME} - Delivery: new tracking update for delivery "${delivery.title}"\n\n` +
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
              const msg = `ModernApps ${MODERN_APP_NAMES.DELIVERME} - Delivery: new tracking update for delivery "${delivery.title}"\n\n` +
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
        message: `Delivery new tracking update!`,
        data: new_delivery_tracking_update,
      }
    };
    return serviceMethodResults;
  }

  static async add_delivered_picture(opts: {
    you: IUser,
    delivery: IDelivery,
    delivered_image?: UploadedFile,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, delivered_image, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the carrier of this delivery.`,
        }
      };
      return serviceMethodResults;
    }
    if (!delivery.datetime_delivered) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery is not delivered yet.`,
        }
      };
      return serviceMethodResults;
    }

    const imageValidation = await validateAndUploadImageFile(delivered_image, {
      treatNotFoundAsError: true
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    
    const updatesobj: PlainObject = {};
    updatesobj.delivered_image_id = imageValidation.info.data.image_id;
    updatesobj.delivered_image_link = imageValidation.info.data.image_link;
    const updates = await update_delivery(delivery_id, updatesobj);

    if (!ignoreNotification) {
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
  
        const to_phone_number = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery added delivered picture!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async mark_delivery_as_picked_up(opts: {
    you: IUser,
    delivery: IDelivery,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the carrier of this delivery.`,
        }
      };
      return serviceMethodResults;
    }
    
    const updatesobj: PlainObject = {};
    updatesobj.datetime_picked_up = fn('NOW');
    const updates = await update_delivery(delivery_id, updatesobj);

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery picked up by carrier!`,
            user: you,
            notification,
          }
        });
  
        const to_phone_number = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery picked up by carrier!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async mark_delivery_as_dropped_off(opts: {
    you: IUser,
    delivery: IDelivery,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the carrier of this delivery.`,
        }
      };
      return serviceMethodResults;
    }

    const updatesobj: PlainObject = {};
    updatesobj.datetime_delivered = fn('NOW');
    const updates = await update_delivery(delivery_id, updatesobj);

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery dropped off by carrier!`,
            user: you,
            notification,
          }
        });
  
        const to_phone_number = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery dropped off by carrier!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  
  static async mark_delivery_as_completed(opts: {
    you: IUser,
    delivery: IDelivery,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (owner_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the owner of this delivery.`,
        }
      };
      return serviceMethodResults;
    }

    if (delivery.completed) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery is already completed.`,
        }
      };
      return serviceMethodResults;
    }

    const updatesobj: PlainObject = {};
    updatesobj.completed = true;
    const updates = await update_delivery(delivery_id, updatesobj);

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery completed!`,
            user: you,
            notification,
          }
        });
  
        const to_phone_number = delivery.carrier?.deliverme_settings?.phone || delivery.carrier?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery completed!`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async mark_delivery_as_returned(opts: {
    you: IUser,
    delivery: IDelivery,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (carrier_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the carrier of this delivery.`,
        }
      };
      return serviceMethodResults;
    }

    if (delivery.returned) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery is already returned.`,
        }
      };
      return serviceMethodResults;
    }

    const updatesobj: PlainObject = {};
    updatesobj.returned = true;
    updatesobj.carrier_id = null;
    updatesobj.carrier_assigned_date = null;
    updatesobj.datetime_picked_up = null;
    const updates = await update_delivery(delivery_id, updatesobj);
    
    const trackingDeletes = await DeliveryTrackingUpdates.destroy({ 
      where: { delivery_id }
    });
    const messagesDeletes = await DeliveryMessages.destroy({ 
      where: { delivery_id }
    });

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery returned`,
            user: you,
            notification,
          }
        });
  
        const to_phone_number = delivery.owner?.deliverme_settings?.phone || delivery.owner?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Delivery returned`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async get_settings(you_id: number) {
    let settings = await DeliverMeUserProfileSettings.findOne({
      where: { user_id: you_id }
    });
    if (!settings) {
      settings = await DeliverMeUserProfileSettings.create({
        user_id: you_id
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: settings,
      }
    };
    return serviceMethodResults;
  }

  static async update_settings(you_id: number, data: any) {
    const updatesObj: any = {};

    let settings = await DeliverMeUserProfileSettings.findOne({
      where: { user_id: you_id }
    });
    if (!settings) {
      settings = await DeliverMeUserProfileSettings.create({
        user_id: you_id
      });
    }

    const dataValidation = validateData({
      data, 
      validators: deliveryme_user_settings_required_props,
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
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async create_checkout_session(opts: {
    you: IUser,
    delivery: IDelivery,
    host: string,
  }) {
    const { you, delivery, host } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;

    if (owner_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the owner of this delivery.`,
        }
      };
      return serviceMethodResults;
    }

    if (delivery.completed) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery is already completed`,
        }
      };
      return serviceMethodResults;
    }

    if (!delivery.owner?.stripe_account_verified) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Owner's stripe account is not setup`,
        }
      };
      return serviceMethodResults;
    }

    if (!delivery.carrier?.stripe_account_verified) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Carrier's stripe account is not setup`,
        }
      };
      return serviceMethodResults;
    }

    const updatesobj: PlainObject = {};
    updatesobj.payment_session_id = '';
    const updates = await update_delivery(delivery_id, updatesobj);

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
    //           name: `Delivery of ${delivery.title} by ${getUserFullName(delivery.carrier)}`,
    //         },
    //         unit_amount: parseFloat(delivery.payout + '00'),
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
      const chargeFeeData = StripeService.add_on_stripe_processing_fee(delivery.payout);
      paymentIntent = await StripeService.stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: chargeFeeData.final_total,
        currency: 'usd',
        application_fee_amount: chargeFeeData.app_fee, // free, for now
        transfer_data: {
          destination: delivery.carrier.stripe_account_id,
        },
      },
      // { stripeAccount: you.stripe_account_id }
      );
    } catch (error) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        error: true,
        info: {
          message: (<any> error).message,
          error
        }
      };
      return serviceMethodResults;
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

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Payment intent created`,
        data: {
          payment_client_secret: paymentIntent.client_secret,
          stripe_pk: process.env.STRIPE_PK
        }
      }
    };
    return serviceMethodResults;
  }

  static async payment_success(opts: {
    you: IUser,
    delivery: IDelivery,
    session_id: string,
    ignoreNotification?: boolean,
  }) {
    const { you, delivery, session_id, ignoreNotification } = opts;
    
    const delivery_id = delivery.id;
    const owner_id = delivery.owner_id;
    const carrier_id = delivery.carrier_id;
    
    if (!session_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Payment session_id was not added as query param on request`,
        }
      };
      return serviceMethodResults;
    }

    if (session_id !== delivery.payment_session_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Payment session_id does not match with delivery`,
        }
      };
      return serviceMethodResults;
    }

    // pay carrier

    const updatesobj: PlainObject = {};
    updatesobj.completed = true;
    const updates = await update_delivery(delivery_id, updatesobj);

    if (!ignoreNotification) {
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
            data: updates,
            message: `Delivery completed!`,
            user: you,
            notification,
          }
        });
  
        const to_phone_number = delivery.carrier?.deliverme_settings?.phone || delivery.carrier?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Payment session completed`,
        data: updates
      }
    };
    return serviceMethodResults;
  }

  static async payment_cancel(opts: {
    you: IUser,
    delivery: IDelivery,
    session_id: string,
  }) {
    const { you, delivery, session_id } = opts;

    if (!session_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Payment session_id was not added as query param on request`,
        }
      };
      return serviceMethodResults;
    }

    if (session_id !== delivery.payment_session_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Payment session_id does not match with delivery`,
        }
      };
      return serviceMethodResults;
    }

    const updatesobj: PlainObject = {};
    updatesobj.payment_session_id = '';
    const updates = await update_delivery(delivery.id, updatesobj);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Payment session canceled`,
        data: updates
      }
    };
    return serviceMethodResults;
  }
}