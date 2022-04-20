import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { ResourcesService } from '../services/resources.service';



export class ResourcesRequestHandler {
  static async get_resource_by_id(request: Request, response: Response): ExpressResponse {
    const resource_model = response.locals.resource_model;
    return response.status(HttpStatusCode.OK).json({
      data: resource_model
    });
  }

  static async create_resource(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      icon_file: request.files && (<UploadedFile> request.files.icon) as UploadedFile | undefined,
      data: request.body,
    };

    const serviceMethodResults: ServiceMethodResults = await ResourcesService.create_resource(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  static async update_resource(request: Request, response: Response): ExpressResponse {
    const options = {
      you: response.locals.you as IUser,
      resource_id: parseInt(request.params.resource_id, 10) as number,
      icon_file: request.files && (<UploadedFile> request.files.icon) as UploadedFile | undefined,
      data: request.body,
    };

    const serviceMethodResults: ServiceMethodResults = await ResourcesService.update_resource(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_resource(request: Request, response: Response): ExpressResponse {
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ResourcesService.delete_resource(resource_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_resources(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const resource_id = parseInt(request.params.resource_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ResourcesService.get_user_resources(user_id, resource_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_resources_all(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ResourcesService.get_user_resources_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}