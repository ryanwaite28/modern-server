import {
  Request,
  Response,
} from 'express';
import { Op } from 'sequelize';
import { Messagings, Messages } from '../models/messages.model';
import { user_attrs_slim } from '../common.chamber';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { PlainObject } from '../interfaces/common.interface';
import { Users } from '../models/user.model';
import { paginateTable } from '../repos/_common.repo';
import { ExpressResponse, ServiceMethodResults } from '../types/common.types';
import { MessagingsService } from '../services/messagings.service';

export class MessagingsRequestHandler {
  static async get_user_messagings_all(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);

    const serviceMethodResults: ServiceMethodResults = await MessagingsService.get_user_messagings_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_messagings(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const messagings_timestamp: string = request.params.messagings_timestamp;

    const serviceMethodResults: ServiceMethodResults = await MessagingsService.get_user_messagings(you_id, messagings_timestamp);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}