import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser,
} from '../../_common/interfaces/common.interface';
import * as CommonRepo from '../../_common/repos/_common.repo';
import {
  user_attrs_slim
} from '../../_common/common.chamber';
import { Users } from '../../_common/models/user.model';
import { ExpressRouteEndHandler } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';
import { ICommonGenericCommentsService } from './create-model-comments-service.helper';



export interface ICreateCommonGenericModelCommentsRequestHandler {
  base_model_name: string;
  commentsService: ICommonGenericCommentsService
}

export interface ICommonGenericCommentsRequestHandler {
  get_comment_by_id: ExpressRouteEndHandler,
  get_comments_count: ExpressRouteEndHandler,
  get_comments_all: ExpressRouteEndHandler,
  get_comments: ExpressRouteEndHandler,
  create_comment: ExpressRouteEndHandler,
  update_comment: ExpressRouteEndHandler,
  delete_comment: ExpressRouteEndHandler,
}

export function createCommonGenericModelCommentsRequestHandler(
  params: ICreateCommonGenericModelCommentsRequestHandler
) {
  const model_id_field = params.base_model_name + '_id';
  const model_field = params.base_model_name + '_model';

  let Class: ICommonGenericCommentsRequestHandler;
  Class = class {
    
    /** Request Handlers */
  
    static async get_comment_by_id(request: Request, response: Response) {
      const comment_model = response.locals.comment_model;
      return response.status(HttpStatusCode.OK).json({
        data: comment_model
      });
    }
  
    static async get_comments_count(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      
      const results = await params.commentsService.get_comments_count(model_id);
      return response.status(results.status).json(results.info);
    }
  
    static async get_comments_all(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      
      const results = await params.commentsService.get_comments_all(model_id);
      return response.status(results.status).json(results.info);
    }
  
    static async get_comments(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const comment_id = parseInt(request.params.comment_id, 10) || undefined;
      
      const results = await params.commentsService.get_comments(model_id, comment_id);
      return response.status(results.status).json(results.info);
    }
  
    static async create_comment(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const base_model = response.locals[model_field];
      let body: string = request.body.body;

      const results = await params.commentsService.create_comment({ you, base_model, body });
      return response.status(results.status).json(results.info);
    }
  
    static async update_comment(request: Request, response: Response) {
      let body: string = request.body.body;
      const comment_id = parseInt(request.params.comment_id, 10);
      
      const results = await params.commentsService.update_comment({ comment_id, body });
      return response.status(results.status).json(results.info);
    }
  
    static async delete_comment(request: Request, response: Response) {
      const comment_id = parseInt(request.params.comment_id, 10);
      
      const results = await params.commentsService.delete_comment(comment_id);
      return response.status(results.status).json(results.info);
    }
  };

  return Class;
}