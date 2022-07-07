import { UploadedFile } from "express-fileupload";
import { StripeService } from "../../_common/services/stripe.service";
import { UsersService } from "../../_common/services/users.service";
import {
  validateData,
  validateAndUploadImageFile,
  COMMON_STATUSES,
} from "../../_common/common.chamber";
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
  delete_mechanic_credential,
  delete_mechanic_expertise,
  delete_mechanic_field,
  delete_mechanic_service,
  delete_mechanic_service_request,
  get_mechanic_by_id,
  get_mechanic_by_user_id,
  get_service_request_by_id,
  search_mechanics,
  search_service_requests,
  update_mechanic_credential,
  update_mechanic_expertise,
  update_mechanic_field,
  update_mechanic_profile,
  update_mechanic_service,
  update_mechanic_service_request,
} from "../repos/car-master.repo";
import { CARMASTER_NOTIFICATION_TARGET_TYPES, CARMASTER_SERVICE_REQUEST_STATUSES } from "../enums/car-master.enum";
import { IUser } from "../../_common/interfaces/common.interface";
import Stripe from "stripe";
import { COMMON_STRIPE_ACTION_EVENTS, COMMON_TRANSACTION_STATUS, MODERN_APP_NAMES } from "../../_common/enums/common.enum";
import { StripeActions } from "../../_common/models/user.model";

export class CarMasterService {
  // users

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
        data: updates,
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

    if (!!service_request.mechanic_id) {
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
  
  static async get_mechanic_by_id(mechanic_id: number): Promise<ServiceMethodResults> {
    const result: IMechanic | null = await get_mechanic_by_id(mechanic_id);
    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: result,
      },
    };
    return serviceMethodResults;
  }

  static async get_mechanic_by_user_id(user_id: number): Promise<ServiceMethodResults> {
    const result: IMechanic | null = await get_mechanic_by_user_id(user_id);
    const serviceMethodResults: ServiceMethodResults = {
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
        data: updates,
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
        data: updates,
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
        data: updates,
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
        data: updates,
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
        data: updates,
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
  

  

  

  

  
}
