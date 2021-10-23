import { UploadedFile } from 'express-fileupload';
import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
  PlainObject,
} from '../../_common/interfaces/common.interface';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { NewsPostsService } from '../services/newsposts.service';

export class NewsPostsRequestHandler {

  static async get_newspost_by_id(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      data: response.locals.newspost_model
    });
  }

  static async get_random_newsposts(request: Request, response: Response): ExpressResponse {
    const serviceMethodResults: ServiceMethodResults = await NewsPostsService.get_random_newsposts();
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_newsposts_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NewsPostsService.get_user_newsposts_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_newsposts(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const newspost_id: number = parseInt(request.params.newspost_id, 10);

    const serviceMethodResults: ServiceMethodResults = await NewsPostsService.get_user_newsposts(user_id, newspost_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async create_newspost(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    let location: string = data.location;
    let lat: number = data.lat;
    let lng: number = data.lng;
    let place_id: string = data.place_id;
    let title: string = data.caption;
    let body: string = data.caption;
    let link: string = data.caption;
    let news_date: any = data.news_date;
    let filesInfo: PlainObject[] = data.filesInfo || [];
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);

    const opts = {
      you,
      photo_files,
      data: {
        location,
        lat,
        lng,
        place_id,
        title,
        body,
        link,
        news_date,
        filesInfo,
      }
    };

    const serviceMethodResults: ServiceMethodResults = await NewsPostsService.create_newspost(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_newspost(request: Request, response: Response): ExpressResponse {
    const newspost_id: number = parseInt(request.params.newspost_id, 10);
    const you: IUser = response.locals.you; 
    let title: string = request.body.caption;
    let body: string = request.body.caption;
    let link: string = request.body.caption;

    const opts = {
      you,
      newspost_id,
      title,
      body,
      link
    };

    const serviceMethodResults: ServiceMethodResults = await NewsPostsService.update_newspost(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_newspost(request: Request, response: Response): ExpressResponse {
    const newspost_id: number = parseInt(request.params.newspost_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NewsPostsService.delete_newspost(newspost_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
