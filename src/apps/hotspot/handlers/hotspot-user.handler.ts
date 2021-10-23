import { Request, Response } from 'express';
import { IUser } from '../../_common/interfaces/common.interface';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { HotspotUsersService } from '../services/hotspot-user.service';



export class HotspotUsersRequestHandler {

  static async get_search_results(request: Request, response: Response): ExpressResponse {
    const model = String(request.query.model || '');
    const query = String(request.query.q || '');
    const min_id = request.query.feed_type ? parseInt(<string>request.query.feed_type, 10) : undefined;

    const serviceMethodResults: ServiceMethodResults = await HotspotUsersService.get_search_results({ model, min_id, query });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_feed(request: Request, response: Response): ExpressResponse {
    const min_id = parseInt(request.params.min_id, 10);
    const you: IUser = response.locals.you;
    const feed_type = String(request.query.feed_type || '');
    const limit = (request.query.limit || '') as string;

    const serviceMethodResults: ServiceMethodResults = await HotspotUsersService.get_user_feed({ user_id: you.id, min_id, feed_type, limit });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
