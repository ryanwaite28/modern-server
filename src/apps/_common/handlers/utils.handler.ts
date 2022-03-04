import { Request, Response } from 'express';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';
import { UtilsService } from '../services/utils.service';
import { CatchRequestHandlerError } from '../decorators/common.decorator';



export class UtilsRequestHandler {
  @CatchRequestHandlerError()
  static async get_xsrf_token(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = UtilsService.set_xsrf_token(response);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_xsrf_token_pair(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = UtilsService.set_xsrf_token_pair(response);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_google_maps_key(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = UtilsService.get_google_maps_key();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_stripe_public_key(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = UtilsService.get_stripe_public_key();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}