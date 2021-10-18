import { Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { IMyModel } from '../../_common/models/common.model-types';
import { UploadedFile } from 'express-fileupload';
import { DeliveriesService } from '../services/deliveries.service';

export class DeliveriesRequestHandler {

  static async find_available_delivery_by_from_city_and_state(request: Request, response: Response) {
    const city: string = request.params.city;
    const state: string = request.params.state;

    const results = await DeliveriesService.find_available_delivery_by_from_city_and_state(city, state);
    return response.status(results.status).json(results.info);
  }

  static async find_available_delivery_by_to_city_and_state(request: Request, response: Response) {
    const city: string = request.params.city;
    const state: string = request.params.state;

    const results = await DeliveriesService.find_available_delivery_by_to_city_and_state(city, state);
    return response.status(results.status).json(results.info);
  }
  
  static async find_available_delivery(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      criteria: request.body.criteria as string,
      city: request.body.city as string,
      state: request.body.state as string,
    }
    
    const results = await DeliveriesService.find_available_delivery(opts);
    return response.status(results.status).json(results.info);
  }
  
  static async search_deliveries(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      from_city: response.locals.from_city as string,
      from_state: request.body.from_state as string,
      to_city: request.body.to_city as string,
      to_state: request.body.to_state as string,
    };

    const results = await DeliveriesService.search_deliveries(opts);
    return response.status(results.status).json(results.info);
  }

  static async send_delivery_message(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
      body: request.body.body as string,
    };
    
    const results = await DeliveriesService.send_delivery_message(opts);
    return response.status(results.status).json(results.info);
  }

  static async get_delivery_by_id(request: Request, response: Response) {
    const delivery: any = response.locals.delivery_model.toJSON();
    return response.status(HttpStatusCode.OK).json({
      data: delivery
    });
  }
  
  static async get_user_deliveries_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const results = await DeliveriesService.get_user_deliveries_all(user_id);
    return response.status(results.status).json(results.info);
  }

  static async get_user_deliveries(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const delivery_id: number | undefined = request.params.delivery_id ? parseInt(request.params.delivery_id, 10) : undefined;
    
    const results = await DeliveriesService.get_user_deliveries(user_id, delivery_id);
    return response.status(results.status).json(results.info);
  }

  static async get_user_deliverings_all(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const results = await DeliveriesService.get_user_deliverings_all(user_id);
    return response.status(results.status).json(results.info);
  }

  static async get_user_deliverings(request: Request, response: Response) {
    const user_id: number = parseInt(request.params.user_id, 10);
    const delivery_id: number | undefined = request.params.delivery_id ? parseInt(request.params.delivery_id, 10) : undefined;

    const results = await DeliveriesService.get_user_deliverings(user_id, delivery_id);
    return response.status(results.status).json(results.info);
  }

  static async get_user_delivering(request: Request, response: Response) {
    const you_id: number = parseInt(request.params.you_id, 10);
    
    const results = await DeliveriesService.get_user_delivering(you_id);
    return response.status(results.status).json(results.info);
  }

  static async create_delivery(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      data: JSON.parse(request.body.payload) as any,
      delivery_image: request.files && (<UploadedFile> request.files.delivery_image)
    };

    const results = await DeliveriesService.create_delivery(opts);
    return response.status(results.status).json(results.info);
  }

  static async update_delivery(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      data: JSON.parse(request.body.payload) as any,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.update_delivery(opts);
    return response.status(results.status).json(results.info);
  }

  static async delete_delivery(request: Request, response: Response) {
    const delivery_model = response.locals.delivery_model as IMyModel;

    const results = await DeliveriesService.delete_delivery(delivery_model);
    return response.status(results.status).json(results.info);
  }

  static async assign_delivery(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.assign_delivery(opts);
    return response.status(results.status).json(results.info);
  }

  static async unassign_delivery(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.unassign_delivery(opts);
    return response.status(results.status).json(results.info);
  }

  static async create_tracking_update(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
      data: JSON.parse(request.body.payload) as any,
      tracking_update_image: request.files && (<UploadedFile> request.files.tracking_update_image),
    };

    const results = await DeliveriesService.create_tracking_update(opts);
    return response.status(results.status).json(results.info);
  }

  static async add_delivered_picture(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
      delivered_image: request.files && (<UploadedFile> request.files.delivered_image),
    };

    const results = await DeliveriesService.add_delivered_picture(opts);
    return response.status(results.status).json(results.info);
  }

  static async mark_delivery_as_picked_up(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.mark_delivery_as_picked_up(opts);
    return response.status(results.status).json(results.info);
  }

  static async mark_delivery_as_dropped_off(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.mark_delivery_as_dropped_off(opts);
    return response.status(results.status).json(results.info);
  }

  
  static async mark_delivery_as_completed(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.mark_delivery_as_completed(opts);
    return response.status(results.status).json(results.info);
  }

  static async mark_delivery_as_returned(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
    };

    const results = await DeliveriesService.mark_delivery_as_returned(opts);
    return response.status(results.status).json(results.info);
  }

  static async get_settings(request: Request, response: Response) {
    const you = response.locals.you as IUser;

    const results = await DeliveriesService.get_settings(you.id);
    return response.status(results.status).json(results.info);
  }

  static async update_settings(request: Request, response: Response) {
    const you = response.locals.you as IUser;
    const data = request.body as any;
    
    const results = await DeliveriesService.update_settings(you.id, data);
    return response.status(results.status).json(results.info);
  }
  
  static async create_checkout_session(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
      host: request.get('origin')! as string,
    };

    const results = await DeliveriesService.create_checkout_session(opts);
    return response.status(results.status).json(results.info);
  }

  static async payment_success(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
      session_id: request.query.session_id as string,
    };

    const results = await DeliveriesService.payment_success(opts);
    return response.status(results.status).json(results.info);
  }

  static async payment_cancel(request: Request, response: Response) {
    const opts = {
      you: response.locals.you as IUser,
      delivery_model: response.locals.delivery_model as IMyModel,
      session_id: request.query.session_id as string,
    };

    const results = await DeliveriesService.payment_cancel(opts);
    return response.status(results.status).json(results.info);
  }
}