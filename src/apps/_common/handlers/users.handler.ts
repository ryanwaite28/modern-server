import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IRequest, IUser, PlainObject } from '../interfaces/common.interface';
import { UsersService } from '../services/users.service';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';

export class UsersRequestHandler {
  @CatchRequestHandlerError()
  static async check_session(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await UsersService.check_session(request);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_by_id(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.id, 10);
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_by_id(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_by_phone(request: Request, response: Response): ExpressResponse {
    const phone = request.params.phone;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_by_phone(phone);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async send_feedback(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const rating: number = request.body.rating;
    const title: string = request.body.title;
    const summary: string = request.body.rating;
    const options = { you, rating, title, summary };
    const serviceMethodResults: ServiceMethodResults = await UsersService.send_feedback(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_unseen_counts(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_unseen_counts(you);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_api_key(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_api_key(you);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_customer_cards_payment_methods(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_user_customer_cards_payment_methods(you.stripe_customer_account_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async add_card_payment_method_to_user_customer(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const payment_method_id: string = request.params.payment_method_id as string;
    const serviceMethodResults: ServiceMethodResults = await UsersService.add_card_payment_method_to_user_customer(you.stripe_customer_account_id, payment_method_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async remove_card_payment_method_to_user_customer(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const payment_method_id: string = request.params.payment_method_id as string;
    const serviceMethodResults: ServiceMethodResults = await UsersService.remove_card_payment_method_to_user_customer(you.stripe_customer_account_id, payment_method_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_user_api_key(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.create_user_api_key(you);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async get_random_users(request: Request, response: Response): ExpressResponse {
    const limit = request.params.limit;
    const serviceMethodResults: ServiceMethodResults = await UsersService.get_random_users(limit);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async sign_up(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      firstname: request.body.firstname as string,
      middlename: request.body.middlename as string,
      lastname: request.body.lastname as string,
      username: request.body.username as string,
      displayname: request.body.displayname as string,
      email: request.body.email as string,
      password: request.body.password as string,
      confirmPassword: request.body.confirmPassword as string,
      request_origin: request.get('origin')! as string
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.sign_up(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async sign_in(request: Request, response: Response): ExpressResponse {
    const email_or_username: string = (request.body.email_or_username || request.body.email || request.body.username);
    const password: string = request.body.password;
    const serviceMethodResults: ServiceMethodResults = await UsersService.sign_in(email_or_username, password);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async send_sms_verification(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const phone = request.params.phone_number;
    const serviceMethodResults: ServiceMethodResults = await UsersService.send_sms_verification(you, phone);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async verify_sms_code(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      request_id: request.params.request_id as string,
      code: request.params.code as string,
      phone: request.params.phone as string,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.verify_sms_code(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async verify_email(request: Request, response: Response): ExpressResponse {
    const verification_code = request.params.verification_code;
    const serviceMethodResults: ServiceMethodResults = await UsersService.verify_email(verification_code);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_info(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      email: request.body.email as string,
      username: request.body.username as string,
      paypal: request.body.paypal as string,
      bio: request.body.bio as string,
      headline: request.body.headline as string,
      tags: request.body.tags as string,
      city: request.body.city as string,
      state: request.body.state as string,
      country: request.body.country as string,
      zipcode: request.body.zipcode as string,
      location: request.body.location as string,
      lat: request.body.lat as number,
      lng: request.body.lng as number,
      can_message: request.body.can_message as boolean,
      can_converse: request.body.can_converse as boolean,
      host: request.get('origin')! as string,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_info(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_phone(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      request_id: request.params.request_id as string,
      code: request.params.code as string,
      phone: request.params.phone as string,
      sms_results: (<IRequest> request).session.sms_verification as PlainObject,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_phone(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_password(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      password: request.body.password as string,
      confirmPassword: request.body.confirmPassword as string,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_password(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_icon(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      icon_file: request.files && (<UploadedFile> request.files.icon) as UploadedFile | undefined,
      should_delete: !!request.body.should_delete as boolean,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_icon(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_wallpaper(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      wallpaper_file: request.files && (<UploadedFile> request.files.wallpaper) as UploadedFile | undefined,
      should_delete: !!request.body.should_delete as boolean,
    };
    const serviceMethodResults: ServiceMethodResults = await UsersService.update_wallpaper(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_stripe_account(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const host: string = request.get('origin')!;
    const serviceMethodResults: ServiceMethodResults = await UsersService.create_stripe_account(you.id, host);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async verify_stripe_account(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.verify_stripe_account(you);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async verify_customer_has_card_payment_method(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await UsersService.verify_customer_has_card_payment_method(you);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async submit_reset_password_request(request: Request, response: Response): ExpressResponse {
    const email: string = request.params.email;
    const request_origin: string = request.get('origin')!;
    const serviceMethodResults: ServiceMethodResults = await UsersService.submit_reset_password_request(email, request_origin);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async submit_password_reset_code(request: Request, response: Response): ExpressResponse {
    const code = request.params.code;
    const request_origin: string = request.get('origin')!;
    const serviceMethodResults: ServiceMethodResults = await UsersService.submit_password_reset_code(code, request_origin);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
