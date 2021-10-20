import {
  Request,
  Response,
} from 'express';
import {
  IUser
} from '../interfaces/common.interface';
import {
  fn,
} from 'sequelize';
import * as CommonRepo from '../repos/_common.repo';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { Notifications } from '../models/user.model';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';
import { NotificationsService } from '../services/notifications.service';


export class NotificationsRequestHandler {

  static async get_user_notifications(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 
    const notification_id: number = parseInt(request.params.notification_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NotificationsService.get_user_notifications(you.id, notification_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_notifications_all(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 

    const serviceMethodResults: ServiceMethodResults = await NotificationsService.get_user_notifications_all(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_user_last_opened(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 
    
    const serviceMethodResults: ServiceMethodResults = await NotificationsService.update_user_last_opened(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}