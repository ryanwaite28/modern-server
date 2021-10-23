import { Request, Response } from 'express';
import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  IUser,
} from '../interfaces/common.interface';
import * as CommonRepo from '../repos/_common.repo';
import {
  user_attrs_slim
} from '../common.chamber';
import { Users } from '../models/user.model';
import { COMMON_REACTION_TYPES } from '../enums/common.enum';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ExpressResponse, ExpressRouteEndHandler, ServiceMethodResults } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';
import { IGenericCommentRepliesService } from './create-model-comment-replies-service.helper';


export interface ICreateCommonGenericModelCommentRepliesRequestHandler {
  commentRepliesService: IGenericCommentRepliesService,
}

export interface IGenericCommentRepliesRequestHandler {
  get_comment_reply_by_id: ExpressRouteEndHandler,
  get_comment_replies_count: ExpressRouteEndHandler,
  get_comment_replies_all: ExpressRouteEndHandler,
  get_comment_replies: ExpressRouteEndHandler,
  create_comment_reply: ExpressRouteEndHandler,
  update_comment_reply: ExpressRouteEndHandler,
  delete_comment_reply: ExpressRouteEndHandler,
}

export function createCommonGenericModelCommentRepliesRequestHandler (
  params: ICreateCommonGenericModelCommentRepliesRequestHandler
): IGenericCommentRepliesRequestHandler {

  let Class: IGenericCommentRepliesRequestHandler;
  Class = class {
    /** Request Handlers */
  
    static async get_comment_reply_by_id(request: Request, response: Response): ExpressResponse {
      const reply_model = response.locals.reply_model;
      return response.status(HttpStatusCode.OK).json({
        data: reply_model
      });
    }
  
    static async get_comment_replies_count(request: Request, response: Response): ExpressResponse {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.commentRepliesService.get_comment_replies_count(comment_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_comment_replies_all(request: Request, response: Response): ExpressResponse {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.commentRepliesService.get_comment_replies_all(comment_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async get_comment_replies(request: Request, response: Response): ExpressResponse {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const reply_id = parseInt(request.params.reply_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.commentRepliesService.get_comment_replies(comment_id, reply_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async create_comment_reply(request: Request, response: Response): ExpressResponse {
      const you: IUser = response.locals.you;
      const comment_model = response.locals.comment_model as IMyModel;
      const body: string = request.body.body;
      
      const serviceMethodResults: ServiceMethodResults = await params.commentRepliesService.create_comment_reply({ body, comment_model, you });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async update_comment_reply(request: Request, response: Response): ExpressResponse {
      const body: string = request.body.body;
      const reply_id = parseInt(request.params.reply_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.commentRepliesService.update_comment_reply({ body, reply_id });
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  
    static async delete_comment_reply(request: Request, response: Response): ExpressResponse {
      const reply_id = parseInt(request.params.reply_id, 10);
      
      const serviceMethodResults: ServiceMethodResults = await params.commentRepliesService.delete_comment_reply(reply_id);
      return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
    }
  };

  return Class;
}