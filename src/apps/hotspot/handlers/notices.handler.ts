import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import { IMyModel } from '../../_common/models/common.model-types';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../../_common/types/common.types';
import { NoticesService } from '../services/notices.service';



export class NoticesRequestHandler {

  static async get_notice_by_id(request: Request, response: Response): ExpressResponse {
    const notice_model: IMyModel = response.locals.notice_model;
    return response.status(HttpStatusCode.OK).json({
      data: notice_model
    });
  }

  static async get_notice_stats(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);

    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_stats(notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_notice_replies_all(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);

    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_replies_all(notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  static async get_notice_replies(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
    const reply_notice_id: number = parseInt(request.params.reply_notice_id, 10);

    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_replies(notice_id, reply_notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_notice_quotes_all(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
  
    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_quotes_all(notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  static async get_notice_quotes(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
    const quote_notice_id: number = parseInt(request.params.quote_notice_id, 10);

    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_quotes(notice_id, quote_notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_notice_shares_all(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_shares_all(notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  static async get_notice_shares(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
    const share_notice_id: number = parseInt(request.params.share_notice_id, 10);

    const serviceMethodResults: ServiceMethodResults = await NoticesService.get_notice_shares(notice_id, share_notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  static async create_notice(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const data: PlainObject = request.body;
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);
    let filesInfo: PlainObject[] = data.filesInfo || [];
    const options = { you_id: you.id, data, photo_files, filesInfo };

    const serviceMethodResults: ServiceMethodResults = await NoticesService.create_notice(options);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_notice(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NoticesService.delete_notice(notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

}