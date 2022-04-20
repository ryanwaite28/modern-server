import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { IUser, PlainObject } from '../../_common/interfaces/common.interface';
import { IMyModel } from '../../_common/models/common.model-types';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { FavorsService } from '../services/favors.service';
import { CatchRequestHandlerError } from '../../_common/decorators/common.decorator';



export class FavorsRequestHandler {

  @CatchRequestHandlerError()
  static async search_favors(request: Request, response: Response): ExpressResponse {
    const opts = {
      you_id: response.locals.you.id as number,
      city: request.body.city as string,
      state: request.body.state as string,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.search_favors(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async send_favor_message(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      body: request.body.body as string,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.send_favor_message(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async create_favor_update(request: Request, response: Response): ExpressResponse {
    const data: PlainObject = JSON.parse(request.body.payload);
    const opts = {
      you: response.locals.you as IUser,
      update_image: request.files && (<UploadedFile> request.files.update_image) as UploadedFile | undefined,
      favor_model: response.locals.favor_model as IMyModel,
      data: {
        message: data.message as string,
        helper_lat: data.helper_lat as number,
        helper_lng: data.helper_lng as number,
      }
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.create_favor_update(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_favor_by_id(request: Request, response: Response): ExpressResponse {
    const favor_model: PlainObject = (<IMyModel> response.locals.favor_model).toJSON();
    return response.status(HttpStatusCode.OK).json({
      data: favor_model,
    });
  }
  
  @CatchRequestHandlerError()
  static async get_user_favors_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_user_favors_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_favors(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_id: number | undefined = request.params.favor_id ? parseInt(request.params.favor_id, 10) : undefined;
    
    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_user_favors(user_id, favor_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_favor_helpings_all_active(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_user_favor_helpings_all_active(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_favor_helpings_active(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_id: number | undefined = request.params.favor_id ? parseInt(request.params.favor_id, 10) : undefined;

    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_user_favor_helpings_active(user_id, favor_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_favor_helpings_all_past(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_user_favor_helpings_all_past(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_favor_helpings_past(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const favor_id: number | undefined = request.params.favor_id ? parseInt(request.params.favor_id, 10) : undefined;
    
    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_user_favor_helpings_past(user_id, favor_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async browse_recent_favors(request: Request, response: Response): ExpressResponse {
    const opts: { you_id: number, favor_id?: number, } = {
      you_id: (response.locals.you?.id as number) || 0
    };
    if (request.params.favor_id) {
      opts.favor_id = parseInt(request.params.favor_id);
    }
    const serviceMethodResults: ServiceMethodResults = await FavorsService.browse_recent_favors(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async browse_featured_favors(request: Request, response: Response): ExpressResponse {
    const opts: { you_id: number, favor_id?: number, } = {
      you_id: response.locals.you?.id as number
    };
    if (request.params.favor_id) {
      opts.favor_id = parseInt(request.params.favor_id);
    }
    const serviceMethodResults: ServiceMethodResults = await FavorsService.browse_featured_favors(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async browse_map_favors(request: Request, response: Response): ExpressResponse {
    const opts = {
      you_id: response.locals.you?.id as number,
      swLat: parseFloat(request.params.swlat?.toString() || '0'),
      swLng: parseFloat(request.params.swlng?.toString() || '0'),
      neLat: parseFloat(request.params.nelat?.toString() || '0'),
      neLng: parseFloat(request.params.nelng?.toString() || '0'),
    };
    const serviceMethodResults: ServiceMethodResults = await FavorsService.browse_map_favors(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async create_favor(request: Request, response: Response): ExpressResponse {
    const data: PlainObject = JSON.parse(request.body.payload);
    const opts = {
      you: response.locals.you as IUser,
      favor_image: request.files && (<UploadedFile> request.files.favor_image) as UploadedFile | undefined,
      data,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.create_favor(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_favor(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
      data: request.body as PlainObject,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.update_favor(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async delete_favor(request: Request, response: Response): ExpressResponse {
    const favor_model: IMyModel = response.locals.favor_model;

    const serviceMethodResults: ServiceMethodResults = await FavorsService.delete_favor(undefined, favor_model);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async assign_favor(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.assign_favor(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async unassign_favor(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.unassign_favor(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async mark_favor_as_started(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.mark_favor_as_started(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_favor_as_fulfilled(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.mark_favor_as_fulfilled(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_favor_as_canceled(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
      reason: request.body.reason as string | undefined,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.mark_favor_as_canceled(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_favor_as_uncanceled(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.mark_favor_as_uncanceled(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_helper_as_helped(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      user_id: parseInt(request.params.user_id, 10) as number,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.mark_helper_as_helped(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_helper_as_unhelped(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      user_id: parseInt(request.params.user_id, 10) as number,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.mark_helper_as_unhelped(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_settings(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;

    const serviceMethodResults: ServiceMethodResults = await FavorsService.get_settings(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_settings(request: Request, response: Response): ExpressResponse {
    const opts = {
      you_id: response.locals.you.id as number,
      data: request.body as PlainObject,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.update_settings(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async pay_helper(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      user: response.locals.user as IUser,
      favor_model: response.locals.favor_model as IMyModel,
    };

    const serviceMethodResults: ServiceMethodResults = await FavorsService.pay_helper(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}