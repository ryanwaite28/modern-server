import { UploadedFile } from "express-fileupload";
import { StripeService } from "../../_common/services/stripe.service";
import { UsersService } from "../../_common/services/users.service";
import {
  validateData,
  validateAndUploadImageFile,
  COMMON_STATUSES,
  validatePhone,
  isProd,
} from "../../_common/common.chamber";
import {
  fn,
} from 'sequelize';
import { HttpStatusCode } from "../../_common/enums/http-codes.enum";
import { ServiceMethodResults } from "../../_common/types/common.types";
import {
  create_mechanic_credential_required_props,
  create_mechanic_expertise_required_props,
  create_mechanic_field_required_props,
  create_mechanic_rating_edit_required_props,
  create_mechanic_rating_required_props,
  create_mechanic_service_request_required_props,
  create_mechanic_service_required_props,
  populate_carmaster_notification_obj,
  update_mechanic_credential_required_props,
  update_mechanic_expertise_required_props,
  update_mechanic_fields,
  update_mechanic_field_required_props,
  update_mechanic_service_request_required_props,
  update_mechanic_service_required_props,
} from "../car-master.chamber";
import {
  IMechanic,
  IMechanicServiceRequest,
  IMechanicServiceRequestOffer,
} from "../interfaces/car-master.interface";
import {
  create_mechanic_credential,
  create_mechanic_expertise,
  create_mechanic_field,
  create_mechanic_from_user_id,
  create_mechanic_rating,
  create_mechanic_rating_edit,
  create_mechanic_service,
  create_mechanic_service_request,
  create_mechanic_service_request_message,
  create_mechanic_service_request_offer,
  delete_mechanic_credential,
  delete_mechanic_expertise,
  delete_mechanic_field,
  delete_mechanic_service,
  delete_mechanic_service_request,
  delete_mechanic_service_request_messages,
  delete_mechanic_service_request_offer,
  find_all_mechanic_service_requests,
  find_all_mechanic_service_request_disputes,
  find_all_mechanic_service_request_dispute_logs,
  find_all_user_service_requests,
  find_mechanic_service_requests,
  find_service_request_dispute,
  find_service_request_offer_pending_by_service_request_id_and_mechanic_id,
  find_user_service_requests,
  get_mechanic_by_id,
  get_mechanic_by_user_id,
  get_service_request_by_id,
  get_user_from_mechanic_id,
  search_mechanics,
  search_service_requests,
  update_mechanic_credential,
  update_mechanic_expertise,
  update_mechanic_field,
  update_mechanic_profile,
  update_mechanic_service,
  update_mechanic_service_request,
  update_mechanic_service_request_offer,
} from "../repos/car-master.repo";
import { CARMASTER_EVENT_TYPES, CARMASTER_NOTIFICATION_TARGET_TYPES, CARMASTER_SERVICE_REQUEST_STATUSES } from "../enums/car-master.enum";
import { IUser, PlainObject } from "../../_common/interfaces/common.interface";
import Stripe from "stripe";
import { COMMON_STRIPE_ACTION_EVENTS, COMMON_TRANSACTION_STATUS, MODERN_APP_NAMES } from "../../_common/enums/common.enum";
import { StripeActions } from "../../_common/models/user.model";
import { create_notification, create_notification_and_send } from "../../_common/repos/notifications.repo";
import { CommonSocketEventsHandler } from "../../_common/services/socket-events-handlers-by-app/common.socket-event-handler";
import { send_sms } from "../../../sms-client";
import moment from 'moment';



export class CarMasterService {
  // users

  static async get_user_service_requests_all(user_id: number) {
    const resultsList = await find_all_user_service_requests(user_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_service_requests(user_id: number, service_request_id?: number) {
    const resultsList = await find_user_service_requests(user_id, service_request_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_service_request_by_id(service_request_id: number): Promise<ServiceMethodResults> {
    const result: IMechanicServiceRequest | null = await get_service_request_by_id(service_request_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }



  // mechanics

  static async get_mechanic_service_requests_all(mechanic_id: number) {
    const resultsList = await find_all_mechanic_service_requests(mechanic_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async get_mechanic_service_requests(mechanic_id: number, service_request_id?: number) {
    const resultsList = await find_mechanic_service_requests(mechanic_id, service_request_id);
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: resultsList,
      }
    };
    return serviceMethodResults;
  }

  static async create_service_request(you: IUser, data: any, service_request_image?: UploadedFile): Promise<ServiceMethodResults> {
    const createObj: any = { user_id: you.id };

    data.user_id = you.id;
    data.status = CARMASTER_SERVICE_REQUEST_STATUSES.OPEN;
    data.city = data.city || '';
    data.state = data.state || '';
    data.country = data.country?.toLowerCase() || '';
    data.zipcode = data.zipcode || 0;
    data.notes = '';

    const dataValidation = validateData({
      data,
      validators: create_mechanic_service_request_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const imageValidation = await validateAndUploadImageFile(service_request_image, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: "image_id",
      link_prop: "image_link",
    });
    if (imageValidation.error) {
      return imageValidation;
    }


    // make sure payment method belongs to user
    const userPaymentMethodsResults = await StripeService.payment_method_belongs_to_customer(
      you.stripe_customer_account_id,
      data.payment_method_id
    );
    if (userPaymentMethodsResults.error) {
      const serviceMethodResults: ServiceMethodResults = {
        status: userPaymentMethodsResults.status,
        error: userPaymentMethodsResults.error,
        info: {
          message: userPaymentMethodsResults.message
        }
      };
      return serviceMethodResults;
    }

    // try charging customer for delivery listing
    let payment_intent: Stripe.PaymentIntent;
    // let charge: Stripe.Charge;

    const is_subscription_active: boolean = (await UsersService.is_subscription_active(you)).info.data as boolean;
    const chargeFeeData = StripeService.add_on_stripe_processing_fee(createObj.payout, is_subscription_active);

    try {
      // https://stripe.com/docs/payments/save-during-payment

      payment_intent = await StripeService.stripe.paymentIntents.create({
        description: `${MODERN_APP_NAMES.CARMASTER} - new service request listing: ${createObj.title}`,
        amount: chargeFeeData.final_total,
        currency: 'usd',
        customer: you.stripe_customer_account_id,
        payment_method: data.payment_method_id,
        off_session: true,
        confirm: true,
      });

      // charge = await StripeService.stripe.charges.create({
      //   description: `${MODERN_APP_NAMES.CARMASTER} - new delivery listing: ${createObj.title}`,
      //   amount: chargeFeeData.final_total,
      //   currency: 'usd',
      //   source: data.payment_method_id,
      // });
    }
    catch (e) {
      console.log(e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Could not charge payment method`,
          error: e,
        }
      };
      return serviceMethodResults;
    }

    // charge was successful; create the service request listing
    
    createObj.payment_intent_id = payment_intent.id;
    // createObj.charge_id = charge.id;

    const service_request = await create_mechanic_service_request(createObj);

    // record the charge

    const payment_intent_action = await StripeActions.create({
      action_event:                        COMMON_STRIPE_ACTION_EVENTS.PAYMENT_INTENT,
      action_id:                           payment_intent.id,
      action_metadata:                     null,
      micro_app:                           MODERN_APP_NAMES.CARMASTER,
      target_type:                         CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id:                           service_request.id,
      target_metadata:                     null,
      status:                              COMMON_TRANSACTION_STATUS.COMPLETED,
    });

    // const charge_action = await StripeActions.create({
    //   action_event:                        COMMON_STRIPE_ACTION_EVENTS.CHARGE,
    //   action_id:                           charge.id,
    //   action_metadata:                     null,
    //   micro_app:                           MODERN_APP_NAMES.CARMASTER,
    //   target_type:                         CARMASTER_NOTIFICATION_TARGET_TYPES.DELIVERY,
    //   target_id:                           new_delivery_model.id,
    //   target_metadata:                     null,
    //   status:                              COMMON_TRANSACTION_STATUS.COMPLETED,
    // });

    // update charge metadata with delivery id

    payment_intent = await StripeService.stripe.paymentIntents.update(
      payment_intent.id,
      { metadata: { service_request_id: service_request.id, was_subscribed: is_subscription_active ? 'true' : 'false' } }
    );

    // charge = await StripeService.stripe.charges.update(
    //   charge.id,
    //   { metadata: { delivery_id: new_delivery_model.id, was_subscribed: is_subscription_active ? 'true' : 'false' } }
    // );

    console.log(`Service request created successfully. ID:`, service_request.id, {
      chargeFeeData,

      payment_intent,
      payment_intent_action: payment_intent_action.toJSON(),

      // charge,
      // charge_action: charge_action.toJSON(),
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request created successfully`,
        data: service_request,
      },
    };
    return serviceMethodResults;
  }

  static async update_service_request(service_request_id: number, data: any, service_request_image?: UploadedFile): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_service_request_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const imageValidation = await validateAndUploadImageFile(service_request_image, {
      treatNotFoundAsError: false,
      mutateObj: updatesObj,
      id_prop: "image_id",
      link_prop: "image_link",
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    const updates = await update_mechanic_service_request(service_request_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request updated successfully`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async delete_service_request(service_request: IMechanicServiceRequest): Promise<ServiceMethodResults> {
    if (!service_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.NOT_FOUND,
        error: true,
        info: {
          message: `Service request not found.`,
        }
      };
      return serviceMethodResults;
    }

    const isInProgress = !!service_request.mechanic_id && !!service_request.datetime_work_started;
    if (isInProgress) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Service request cannot be deleted while it is in progress.`,
        }
      };
      return serviceMethodResults;
    }

    // try to refund the charge

    if (service_request.payment_intent_id) {
      const payment_intent = await StripeService.stripe.paymentIntents.retrieve(service_request.payment_intent_id);
      let refund: Stripe.Refund;

      const was_subscribed: boolean = payment_intent.metadata['was_subscribed'] === 'true' ? true : false;
      
      const chargeFeeData = StripeService.add_on_stripe_processing_fee(service_request.payout, was_subscribed);

      try {
        refund = await StripeService.stripe.refunds.create({
          payment_intent: service_request.payment_intent_id,
          amount: chargeFeeData.refund_amount,
        });
        
        // record the refund
        const refund_action = await StripeActions.create({
          action_event:                        COMMON_STRIPE_ACTION_EVENTS.REFUND,
          action_id:                           refund.id,
          action_metadata:                     null,
          micro_app:                           MODERN_APP_NAMES.CARMASTER,
          target_type:                         CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
          target_id:                           service_request.id,
          target_metadata:                     null,
          status:                              COMMON_TRANSACTION_STATUS.COMPLETED,
        });

        console.log(`refund issued and recorded successfully`, {
          refund_amount: chargeFeeData.refund_amount,
          refund_id: refund.id,
          refund_action_id: refund_action.get('id')
        });
      } catch (e) {
        console.log(e);
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.INTERNAL_SERVER_ERROR,
          error: true,
          info: {
            message: `Could not issue refund`,
            error: e,
          }
        };
        return serviceMethodResults;
      }
    }

    if (service_request.charge_id) {
      const charge = await StripeService.stripe.charges.retrieve(service_request.charge_id);
      let refund: Stripe.Refund;

      const was_subscribed: boolean = charge.metadata['was_subscribed'] === 'true' ? true : false;
      
      const chargeFeeData = StripeService.add_on_stripe_processing_fee(service_request.payout, was_subscribed);

      try {
        refund = await StripeService.stripe.refunds.create({
          charge: service_request.charge_id,
          amount: chargeFeeData.refund_amount,
        });
        
        // record the refund
        const refund_action = await StripeActions.create({
          action_event:                        COMMON_STRIPE_ACTION_EVENTS.REFUND,
          action_id:                           refund.id,
          action_metadata:                     null,
          micro_app:                           MODERN_APP_NAMES.CARMASTER,
          target_type:                         CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
          target_id:                           service_request.id,
          target_metadata:                     null,
          status:                              COMMON_TRANSACTION_STATUS.COMPLETED,
        });

        console.log(`refund issued and recorded successfully`, {
          refund_amount: chargeFeeData.refund_amount,
          refund_id: refund.id,
          refund_action_id: refund_action.get('id')
        });
      } catch (e) {
        console.log(e);
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.INTERNAL_SERVER_ERROR,
          error: true,
          info: {
            message: `Could not issue refund`,
            error: e,
          }
        };
        return serviceMethodResults;
      }
    }

    const deletes = await delete_mechanic_service_request(service_request.id);

    if (!!service_request.datetime_work_started) {
      // notify mechanic that user canceled
      create_notification({
        from_id: service_request.user_id,
        to_id: service_request.mechanic!.user_id,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_USER_CANCELED,
        micro_app: MODERN_APP_NAMES.CARMASTER,
        target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
        target_id: service_request.id
      }).then(async (notification_model) => {
        const notification = await populate_carmaster_notification_obj(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: service_request.mechanic!.user_id,
          event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_USER_CANCELED,
          event_data: {
            service_request_id: service_request.id,
            notification,
          }
        });

        const to_phone_number = service_request.mechanic?.phone || service_request.mechanic?.user?.phone;
        if (!!to_phone_number && validatePhone(to_phone_number)) {
          send_sms({
            to_phone_number,
            message: `ModernApps ${MODERN_APP_NAMES.CARMASTER} - ` + notification.message,
          });
        }
      });
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }



  // mechanic profile
  
  static async get_mechanic_by_id(mechanic_id: number): Promise<ServiceMethodResults<IMechanic | null>> {
    const result: IMechanic | null = await get_mechanic_by_id(mechanic_id);
    const serviceMethodResults: ServiceMethodResults<IMechanic | null> = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }

  static async get_mechanic_by_user_id(user_id: number): Promise<ServiceMethodResults<IMechanic | null>> {
    const result: IMechanic | null = await get_mechanic_by_user_id(user_id);
    const serviceMethodResults: ServiceMethodResults<IMechanic | null> = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }

  static async get_user_from_mechanic_id(mechanic_id: number): Promise<ServiceMethodResults<IUser>> {
    const result: IUser = await get_user_from_mechanic_id(mechanic_id);
    const serviceMethodResults: ServiceMethodResults<IUser> = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }
  
  static async create_mechanic_profile(user_id: number): Promise<ServiceMethodResults<IMechanic>> {
    const check: IMechanic | null = await get_mechanic_by_user_id(user_id);
    if (check) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `User already has a mechanic profile`,
        },
      };
      return serviceMethodResults;
    }
    const result: IMechanic = await create_mechanic_from_user_id(user_id);
    const serviceMethodResults: ServiceMethodResults<IMechanic> = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic profile created successfully!`,
        data: result,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_profile(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    if (!data) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No updates date given.`,
        },
      };
      return serviceMethodResults;
    }
    const updatesObj: any = {};
    for (const field of update_mechanic_fields) {
      if (data.hasOwnProperty(field)) {
        updatesObj[field] = data[field];
      }
    }
    const updates = await update_mechanic_profile(mechanic_id, updatesObj);
    // console.log({ mechanic_id, updatesObj, updates });
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic profile updated successfully!`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }
  
  static async search_mechanics(data: any, you_id?: number): Promise<ServiceMethodResults> {
    const results = await search_mechanics(data, you_id);
    // console.log(`search_mechanics`, { results });

    // filter those who are active
    // const filtered = [];
    // for (const mechanic of results) {
    //   const is_subscription_active = await StripeService.is_subscription_active(mechanic.user!.platform_subscription_id);
    //   if (is_subscription_active) {
    //     filtered.push(mechanic);
    //   }
    // }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results,
      },
    };
    return serviceMethodResults;
  }

  static async search_service_requests(data: any, you_id?: number): Promise<ServiceMethodResults> {
    const results = await search_service_requests(data, you_id);
    // console.log(`search_service_requests`, { results });

    // filter those who are active
    // const filtered = [];
    // for (const mechanic of results) {
    //   const is_subscription_active = await StripeService.is_subscription_active(mechanic.user!.platform_subscription_id);
    //   if (is_subscription_active) {
    //     filtered.push(mechanic);
    //   }
    // }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results,
      },
    };
    return serviceMethodResults;
  }
  
  
  // mechanic field

  static async create_mechanic_field(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_field_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const field = await create_mechanic_field(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic field created successfully`,
        data: field,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_field(field_id: number, data: any): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_field_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_mechanic_field(field_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic field updated successfully`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_field(field_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_field(field_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic field deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }


  // mechanic credential

  static async create_mechanic_credential(mechanic_id: number, data: any, credential_image?: UploadedFile): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_credential_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const imageValidation = await validateAndUploadImageFile(credential_image, {
      treatNotFoundAsError: false,
      mutateObj: createObj,
      id_prop: "image_id",
      link_prop: "image_link",
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    const credential = await create_mechanic_credential(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic credential created successfully`,
        data: credential,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_credential(credential_id: number, data: any, credential_image?: UploadedFile): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_credential_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const imageValidation = await validateAndUploadImageFile(credential_image, {
      treatNotFoundAsError: false,
      mutateObj: updatesObj,
      id_prop: "image_id",
      link_prop: "image_link",
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    const updates = await update_mechanic_credential(credential_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic credential updated successfully`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_credential(credential_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_credential(credential_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic credential deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }



  // mechanic expertise

  static async create_mechanic_expertise(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_expertise_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const expertise = await create_mechanic_expertise(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic experise created successfully`,
        data: expertise,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_expertise(expertise_id: number, data: any): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_expertise_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_mechanic_expertise(expertise_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic expertise updated successfully`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_expertise(expertise_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_expertise(expertise_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic expertise deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }




  // mechanic service

  static async create_mechanic_service(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_service_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const service = await create_mechanic_service(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic service created successfully`,
        data: service,
      },
    };
    return serviceMethodResults;
  }

  static async update_mechanic_service(service_id: number, data: any): Promise<ServiceMethodResults> {
    const updatesObj: any = {};
    const dataValidation = validateData({
      data,
      validators: update_mechanic_service_required_props,
      mutateObj: updatesObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const updates = await update_mechanic_service(service_id, updatesObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic service updated successfully`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async delete_mechanic_service(service_id: number): Promise<ServiceMethodResults> {
    const deletes = await delete_mechanic_service(service_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic service deleted successfully`,
        data: deletes,
      },
    };
    return serviceMethodResults;
  }
  



  // mechanic rating

  static async create_mechanic_rating(mechanic_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { mechanic_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_rating_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const rating = await create_mechanic_rating(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic rating created successfully`,
        data: rating,
      },
    };
    return serviceMethodResults;
  }

  static async create_mechanic_rating_edit(rating_id: number, data: any): Promise<ServiceMethodResults> {
    const createObj: any = { rating_id };
    const dataValidation = validateData({
      data,
      validators: create_mechanic_rating_edit_required_props,
      mutateObj: createObj,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    const rating_edit = await create_mechanic_rating_edit(createObj);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Mechanic rating edit created successfully`,
        data: rating_edit,
      },
    };
    return serviceMethodResults;
  }




  
  // service requests

  static async mechanic_check_service_request_offer(you: IUser, mechanic_id: number, service_request: IMechanicServiceRequest) {
    // assume the route guards prepared/validated checks for: you, mechanic, service request

    const check_existing_offer = await find_service_request_offer_pending_by_service_request_id_and_mechanic_id({
      mechanic_id,
      service_request_id: service_request.id,
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: check_existing_offer,
      },
    };
    return serviceMethodResults;
  }

  static async send_service_request_offer(you: IUser, mechanic_id: number, service_request: IMechanicServiceRequest) {
    // assume the route guards prepared/validated checks for: you, mechanic, service request

    const check_existing_offer = await find_service_request_offer_pending_by_service_request_id_and_mechanic_id({
      mechanic_id,
      service_request_id: service_request.id,
    });
    
    if (!!check_existing_offer) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Already made offer`,
          data: check_existing_offer,
        },
      };
      return serviceMethodResults;
    }

    const new_offer = await create_mechanic_service_request_offer({
      service_request_id: service_request.id,
      service_request_user_id: service_request.user_id,
      mechanic_id,
      status: COMMON_STATUSES.PENDING,
      notes: '',
    });

    create_notification_and_send({
      from_id: you.id,
      to_id: service_request.user_id,
      event: CARMASTER_EVENT_TYPES.NEW_SERVICE_REQUEST_OFFER,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id,

      notification_populate_fn: populate_carmaster_notification_obj,
      to_phone: service_request.user?.phone,

      extras_data: {
        service_request_id: service_request.id,
        data: new_offer,
        user_id: you.id,
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Offer sent`,
        data: new_offer,
      },
    };
    return serviceMethodResults;
  }

  static async cancel_service_request_offer(you: IUser, mechanic_id: number, service_request: IMechanicServiceRequest) {
    // assume the route guards prepared/validated checks for: you, mechanic, service request

    const check_existing_offer = await find_service_request_offer_pending_by_service_request_id_and_mechanic_id({
      mechanic_id,
      service_request_id: service_request.id,
    });
    
    if (!check_existing_offer) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Cannot find offer`,
          data: check_existing_offer,
        },
      };
      return serviceMethodResults;
    }

    const updates = await update_mechanic_service_request_offer(check_existing_offer.id, {
      status: COMMON_STATUSES.CANCELED,
    });

    create_notification_and_send({
      from_id: you.id,
      to_id: service_request.user_id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_OFFER_CANCELED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id,

      notification_populate_fn: populate_carmaster_notification_obj,
      to_phone: service_request.user?.phone,

      extras_data: {
        service_request_id: service_request.id,
        data: updates[1],
        user_id: you.id,
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Offer canceled`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async decline_service_request_offer(you: IUser, service_request_offer: IMechanicServiceRequestOffer) {
    // assume all guards are validated
    if (service_request_offer.status !== COMMON_STATUSES.PENDING) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Offer is not in a pending state`,
        },
      };
      return serviceMethodResults;
    }

    const updates = await update_mechanic_service_request_offer(service_request_offer.id, {
      status: COMMON_STATUSES.DECLINED
    });

    create_notification_and_send({
      from_id: you.id,
      to_id: service_request_offer.mechanic!.user!.id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_OFFER_DECLINED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request_offer.service_request_id,

      notification_populate_fn: populate_carmaster_notification_obj,
      to_phone: service_request_offer.mechanic!.phone || service_request_offer.mechanic!.user!.phone,

      extras_data: {
        service_request_id: service_request_offer.service_request_id,
        data: updates[1],
        user_id: you.id,
        user: service_request_offer.user
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Offer declined`,
        data: updates[1],
      },
    };
    return serviceMethodResults;
  }

  static async accept_service_request_offer(you: IUser, service_request_offer: IMechanicServiceRequestOffer) {
    if (service_request_offer.status !== COMMON_STATUSES.PENDING) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Offer is not in a pending state`,
        },
      };
      return serviceMethodResults;
    }

    const updates = await update_mechanic_service_request_offer(service_request_offer.id, {
      status: COMMON_STATUSES.ACCEPTED
    });

    // assign mechanic to service request
    const service_request_updates = await update_mechanic_service_request(service_request_offer.service_request_id, {
      mechanic_id: service_request_offer.mechanic_id,
      status: CARMASTER_SERVICE_REQUEST_STATUSES.IN_PROGRESS,
      datetime_accepted: fn('NOW') as any
    })

    create_notification_and_send({
      from_id: you.id,
      to_id: service_request_offer.mechanic!.user!.id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_OFFER_ACCEPTED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request_offer.service_request_id,

      notification_populate_fn: populate_carmaster_notification_obj,
      to_phone: service_request_offer.mechanic!.phone || service_request_offer.mechanic!.user!.phone,

      extras_data: {
        service_request_id: service_request_offer.service_request_id,
        data: { updates, service_request_updates },
        user_id: you.id,
        user: service_request_offer.user,
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Offer accepted`,
        data: { updates: updates[1], service_request: service_request_updates[1] },
      },
    };
    return serviceMethodResults;
  }



  static async service_request_user_canceled(you_id: number, service_request: IMechanicServiceRequest) {
    if (service_request.user_id !== you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the owner of this service request.`,
        }
      };
      return serviceMethodResults;
    }

    if (!!service_request.datetime_work_finished) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Work already finished`,
        }
      };
      return serviceMethodResults;
    }
    
    // delete the children relationship data
    await delete_mechanic_service_request_messages({ where: { service_request_id: service_request.id } });

    const updatesobj: Partial<IMechanicServiceRequest> | any = {};
    updatesobj.mechanic_id = null;
    updatesobj.datetime_accepted = null;
    updatesobj.datetime_declined = null;
    updatesobj.datetime_work_started = null;
    updatesobj.status = CARMASTER_SERVICE_REQUEST_STATUSES.OPEN;
    const updates = await update_mechanic_service_request(service_request.id, updatesobj);

    create_notification({
      from_id: you_id,
      to_id: service_request.mechanic!.user_id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_USER_CANCELED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: service_request.mechanic!.user_id,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_USER_CANCELED,
        event_data: {
          service_request_id: service_request.id,
          data: updates[1],
          message: notification.message,
          user_id: you_id,
          notification,
        }
      });

      const to_phone_number = service_request.mechanic?.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request canceled`,
        data: updates[1],
      }
    };
    return serviceMethodResults;
  }

  static async service_request_mechanic_canceled(you_id: number, service_request: IMechanicServiceRequest) {
    if (service_request.mechanic_id !== you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the mechanic of this service request.`,
        }
      };
      return serviceMethodResults;
    }

    if (!!service_request.datetime_work_finished) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Work already finished`,
        }
      };
      return serviceMethodResults;
    }
    
    // delete the children relationship data
    await delete_mechanic_service_request_messages({ where: { service_request_id: service_request.id } });

    const updatesobj: Partial<IMechanicServiceRequest> | any = {};
    updatesobj.mechanic_id = null;
    updatesobj.datetime_accepted = null;
    updatesobj.datetime_declined = null;
    updatesobj.datetime_work_started = null;
    updatesobj.status = CARMASTER_SERVICE_REQUEST_STATUSES.OPEN;
    const updates = await update_mechanic_service_request(service_request.id, updatesobj);

    create_notification({
      from_id: you_id,
      to_id: service_request.user_id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_MECHANIC_CANCELED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: service_request.user_id,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_MECHANIC_CANCELED,
        event_data: {
          service_request_id: service_request.id,
          data: updates[1],
          message: notification.message,
          user_id: you_id,
          notification,
        }
      });

      const to_phone_number = service_request.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request canceled`,
        data: updates[1],
      }
    };
    return serviceMethodResults;
  }



  static async send_service_request_message(options: {
    you_id: number,
    service_request: IMechanicServiceRequest,
    body: string,
  }) {
    const { you_id, service_request, body } = options;
  

    if (you_id !== service_request.user_id && you_id !== service_request.mechanic_id) {
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
    const new_message = await create_mechanic_service_request_message({
      user_id: you_id,
      service_request_id: service_request.id,
      body
    });

    const to_id = you_id === service_request.user_id ? service_request.mechanic!.user_id : service_request.user_id;
    
    create_notification({
      from_id: you_id,
      to_id: to_id,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      event: CARMASTER_EVENT_TYPES.NEW_SERVICE_REQUEST_MESSAGE,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);

      const eventData = {
        service_request_id: service_request.id,
        event: CARMASTER_EVENT_TYPES.NEW_SERVICE_REQUEST_MESSAGE,
        message: `New message for service request "${service_request.title}": ${body}`,
        micro_app: MODERN_APP_NAMES.DELIVERME,
        data: new_message,
        user_id: you_id,
        notification,
      }
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: to_id,
        event: CARMASTER_EVENT_TYPES.NEW_SERVICE_REQUEST_MESSAGE,
        event_data: eventData
      });

      const to_phone_number = you_id === service_request.user_id
        ? service_request.user?.phone
        : service_request.mechanic?.phone || service_request.mechanic?.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.CARMASTER} - ` + eventData.message,
        });
      }
    });
    
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: new_message,
      }
    };
    return serviceMethodResults;
  }
  
  static async mark_service_request_as_work_started(options: {
    you_id: number,
    service_request: IMechanicServiceRequest,
  }) {
    const { you_id, service_request } = options;

    if (service_request.mechanic_id !== you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the mechanic assigned to this service request.`,
        }
      };
      return serviceMethodResults;
    }

    if (!!service_request.datetime_work_started) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Work already started`,
        }
      };
      return serviceMethodResults;
    }
    
    const updatesobj: Partial<IMechanicServiceRequest> | any = {};
    updatesobj.datetime_work_started = fn('NOW');
    const updates = await update_mechanic_service_request(service_request.id, updatesobj);

    create_notification({
      from_id: you_id,
      to_id: service_request.user_id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_WORK_STARTED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: service_request.user_id,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_WORK_STARTED,
        event_data: {
          service_request_id: service_request.id,
          data: updates[1],
          message: `Mechanic started work on service request "${service_request.title}"`,
          user_id: you_id,
          notification,
        }
      });

      const to_phone_number = service_request.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Work started!`,
        data: updates[1]?.datetime_work_started,
      }
    };
    return serviceMethodResults;
  }

  static async mark_service_request_as_work_finished(options: {
    you_id: number,
    service_request: IMechanicServiceRequest,
  }) {
    const { you_id, service_request } = options;

    if (service_request.mechanic_id !== you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the mechanic assigned to this service request.`,
        }
      };
      return serviceMethodResults;
    }

    if (!service_request.datetime_work_started) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Work was not started`,
        }
      };
      return serviceMethodResults;
    }

    if (!!service_request.datetime_work_finished) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Work already finished`,
        }
      };
      return serviceMethodResults;
    }
    
    const updatesobj: Partial<IMechanicServiceRequest> | any = {};
    updatesobj.datetime_work_finished = fn('NOW');
    const updates = await update_mechanic_service_request(service_request.id, updatesobj);

    create_notification({
      from_id: you_id,
      to_id: service_request.user_id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_WORK_FINISHED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: service_request.user_id,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_WORK_FINISHED,
        event_data: {
          service_request_id: service_request.id,
          data: updates[1],
          message: `Mechanic finished work on service request "${service_request.title}"`,
          user_id: you_id,
          notification,
        }
      });

      const to_phone_number = service_request.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Worked finished!`,
        data: updates[1]?.datetime_work_finished,
      }
    };
    return serviceMethodResults;
  }

  static async add_work_finished_picture(options: {
    you_id: number,
    service_request: IMechanicServiceRequest,
    work_finished_image?: UploadedFile,
  }) {
    const { you_id, service_request, work_finished_image } = options;
    
    const service_request_id = service_request.id;
    const owner_id = service_request.user_id;
    const mechanic_id = service_request.mechanic_id;

    if (mechanic_id !== you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the mechanic of this service request.`,
        }
      };
      return serviceMethodResults;
    }
    if (!service_request.datetime_work_finished) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Work not marked as finished.`,
        }
      };
      return serviceMethodResults;
    }

    const imageValidation = await validateAndUploadImageFile(work_finished_image, {
      treatNotFoundAsError: true
    });
    if (imageValidation.error) {
      return imageValidation;
    }
    
    const updatesobj: PlainObject = {};
    updatesobj.work_finished_image_id = imageValidation.info.data.image_id;
    updatesobj.work_finished_image_link = imageValidation.info.data.image_link;
    const updates = await update_mechanic_service_request(service_request_id, updatesobj);

    create_notification({
      from_id: you_id,
      to_id: owner_id,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_ADD_WORK_FINISHED_PICTURE,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request_id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: owner_id,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_ADD_WORK_FINISHED_PICTURE,
        event_data: {
          service_request_id,
          data: updates[1],
          message: `Service request added work finished picture!`,
          user_id: you_id,
          notification,
          ...imageValidation.info.data
        }
      });

      const to_phone_number = service_request.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request added work finished picture!`,
        data: {
          ...updates,
          ...imageValidation.info.data 
        },
      }
    };
    return serviceMethodResults;
  }

  static async mark_service_request_as_completed(options: {
    you_id: number,
    service_request: IMechanicServiceRequest,
  }) {
    const { you_id, service_request } = options;

    if (service_request.user_id !== you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the owner of this service request.`,
        }
      };
      return serviceMethodResults;
    }

    if (!!service_request.datetime_completed) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Already completed`,
        }
      };
      return serviceMethodResults;
    }
    
    const updatesobj: Partial<IMechanicServiceRequest> | any = {};
    updatesobj.datetime_completed = fn('NOW');
    updatesobj.status = CARMASTER_SERVICE_REQUEST_STATUSES.COMPLETED;
    const updates = await update_mechanic_service_request(service_request.id, updatesobj);

    create_notification({
      from_id: you_id,
      to_id: service_request.mechanic_id!,
      event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_COMPLETED,
      micro_app: MODERN_APP_NAMES.CARMASTER,
      target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id: service_request.id
    }).then(async (notification_model) => {
      const notification = await populate_carmaster_notification_obj(notification_model);
      
      CommonSocketEventsHandler.emitEventToUserSockets({
        user_id: service_request.mechanic_id!,
        event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_COMPLETED,
        event_data: {
          service_request_id: service_request.id,
          data: updates[1],
          message: `Completed service request "${service_request.title}"`,
          user_id: you_id,
          notification,
        }
      });

      const to_phone_number = service_request.user?.phone;
      if (!!to_phone_number && validatePhone(to_phone_number)) {
        send_sms({
          to_phone_number,
          message: `ModernApps ${MODERN_APP_NAMES.DELIVERME}: ` + notification.message,
        });
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Service request completed!`,
        data: updates[1]?.datetime_work_finished,
      }
    };
    return serviceMethodResults;
  }

  

  static async pay_mechanic_via_transfer(you: IUser, service_request: IMechanicServiceRequest) {
    if (service_request.user_id !== you.id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not the owner of this delivery.`,
        }
      };
      return serviceMethodResults;
    }

    if (!!service_request.datetime_completed) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Delivery is already completed`,
        }
      };
      return serviceMethodResults;
    }

    if (!service_request.user?.stripe_account_verified || !service_request.user?.stripe_account_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Owner's stripe account is not setup`,
        }
      };
      return serviceMethodResults;
    }

    if (!service_request.mechanic?.user?.stripe_account_verified || !service_request.mechanic?.user?.stripe_account_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Mechanic's stripe account is not setup`,
        }
      };
      return serviceMethodResults;
    }

    const balance = await StripeService.stripe.balance.retrieve();
    console.log({ balance }, JSON.stringify(balance));
    
    const payment_intent = await StripeService.stripe.paymentIntents.retrieve(service_request.payment_intent_id, { expand: ['charges'] });
    // const was_subscribed: boolean = payment_intent.metadata['was_subscribed'] === 'true' ? true : false;
    // const chargeFeeData = StripeService.add_on_stripe_processing_fee(delivery.payout, was_subscribed);

    const transferAmount = service_request.payout * 100;
    const mechanicHasMembershipResults = await UsersService.is_subscription_active(service_request.mechanic?.user! as IUser);
    const deduction = Math.ceil(transferAmount * 0.1);
    const useTransferAmount = mechanicHasMembershipResults.info.data
      ? transferAmount
      : (transferAmount - deduction);
    const charge_id = payment_intent.charges.data[0].id;
    console.log({ payment_intent_id: payment_intent.id, charge_id, transferAmount, deduction, useTransferAmount });
    
    // try transferring
    let transfer: Stripe.Transfer;
    try {
      const transferCreateData: Stripe.TransferCreateParams = {
        description: `${MODERN_APP_NAMES.CARMASTER} - payment for service request listing: ${service_request.title}`,
        amount: useTransferAmount,
        currency: 'usd',
        destination: service_request.mechanic?.user!.stripe_account_id,
        source_transaction: charge_id, 

        metadata: {
          service_request_id: service_request.id,
          transfer_event: CARMASTER_EVENT_TYPES.SERVICE_REQUEST_COMPLETED,
          micro_app: MODERN_APP_NAMES.CARMASTER,
          target_type: CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
          target_id: service_request.id
        }
      };

      console.log({ transferCreateData });

      transfer = await StripeService.stripe.transfers.create(transferCreateData);
    }
    catch (e) {
      console.log(e);
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Could not transfer...`,
          error: e,
        }
      };
      return serviceMethodResults;
    }

    // record the transaction
    const transfer_action = await StripeActions.create({
      action_event:                        COMMON_STRIPE_ACTION_EVENTS.TRANSFER,
      action_id:                           transfer.id,
      action_metadata:                     null,
      micro_app:                           MODERN_APP_NAMES.CARMASTER,
      target_type:                         CARMASTER_NOTIFICATION_TARGET_TYPES.SERVICE_REQUEST,
      target_id:                           service_request.id,
      target_metadata:                     null,
      status:                              COMMON_TRANSACTION_STATUS.COMPLETED,
    });

    console.log(`Service request paid successfully via transfer. Service request ID:`, service_request.id, {
      transfer,
      transfer_action: transfer_action.toJSON(),
    });


    const deliveryCompletedResults = await CarMasterService.mark_service_request_as_completed({ you_id: you.id, service_request });

    deliveryCompletedResults.info.message && console.log(deliveryCompletedResults.info.message);

    if (deliveryCompletedResults.error) {
      return deliveryCompletedResults;
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Payment successful!`,
      }
    };
    return serviceMethodResults;
  }

  static async mechanic_self_pay(you: IUser, service_request: IMechanicServiceRequest) {
    /*
      after a certain amount of time after completing work, mechanic can receive funds if the service request owner does not dispute
    */

    // check how long it has been since delivery marked as delivered
    const momentNow = moment(new Date());
    const momentDelivered = moment(service_request.datetime_work_finished);
    const momentDiff = momentDelivered.diff(momentNow);
    const hoursSinceDelivered = moment.duration(momentDiff).asHours();
    const atLeast8HoursAgo = hoursSinceDelivered >= 8;

    if (!atLeast8HoursAgo) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Not 8 hours since work completed to self pay`,
        }
      };
      return serviceMethodResults;
    }

    const dispute = await find_service_request_dispute({ where: { service_request_id: service_request.id } });
    if (!!dispute) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Cannot self pay during active dispute`,
        }
      };
      return serviceMethodResults;
    }

    const results = await CarMasterService.pay_mechanic_via_transfer(service_request.user!, service_request );
    return results;
  }

  // static async open_service_request_dispute(you: IUser, service_request: IMechanicServiceRequest, data: any) {
    
  // }

  // static async add_service_request_dispute_log(you: IUser, service_request: IMechanicServiceRequest, data: any) {
    
  // }

  // static async make_service_request_dispute_settlement_offer(you: IUser, service_request: IMechanicServiceRequest, data: any) {
    
  // }


  
}
