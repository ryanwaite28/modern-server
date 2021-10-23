import { Request, Response } from 'express';
import { IUser } from '../../_common/interfaces/common.interface';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { ResourceInterestsService } from '../services/resource-interests.service';



export class ResourceInterestsRequestHandler {
  static async get_user_resource_interests(request: Request, response: Response): ExpressResponse {
    const user_id = parseInt(request.params.user_id, 10);
    const interest_id = parseInt(request.params.interest_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.get_user_resource_interests(user_id, interest_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_resource_interests_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.get_user_resource_interests_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_resource_interests_all(request: Request, response: Response): ExpressResponse {
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.get_resource_interests_all(resource_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_resource_interests(request: Request, response: Response): ExpressResponse {
    const resource_id: number = parseInt(request.params.resource_id, 10);
    const interest_id: number = parseInt(request.params.interest_id, 10);
  
    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.get_resource_interests(resource_id, interest_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async check_interest(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.check_interest(you_id, resource_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async show_interest(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.show_interest({ you, resource_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async remove_interest(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const resource_id: number = parseInt(request.params.resource_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ResourceInterestsService.remove_interest({ you, resource_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}