import { Request, Response } from 'express';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { InfoService } from '../services/info.service';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';

export class InfoRequestHandler {
  @CatchRequestHandlerError()
  static async get_site_info(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await InfoService.get_site_info();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_recent_activity(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await InfoService.get_recent_activity();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  /** External API calls */

  @CatchRequestHandlerError()
  static async get_business_news(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await InfoService.get_business_news();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}