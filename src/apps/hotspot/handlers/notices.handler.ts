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
  
  static async create_notice(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const data: PlainObject = request.body;
    const photo_files: UploadedFile | undefined = request.files && (<UploadedFile> request.files.photos);
    let filesInfo: PlainObject[] = data.filesInfo || [];
    const opts = { you_id: you.id, data, photo_files, filesInfo };

    const serviceMethodResults: ServiceMethodResults = await NoticesService.create_notice(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_notice(request: Request, response: Response): ExpressResponse {
    const notice_id: number = parseInt(request.params.notice_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NoticesService.delete_notice(notice_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

}