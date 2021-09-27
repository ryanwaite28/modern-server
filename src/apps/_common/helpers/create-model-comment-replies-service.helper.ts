import {
  Request,
  Response,
} from 'express';
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
import { createCommonGenericModelReactionsService, IGenericModelReactionsService } from './create-model-reactions-service.helper';
import { ExpressRouteEndHandler } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';


export interface ICreateCommonGenericModelCommentRepliesService {
  micro_app: string,
  create_model_event: string,
  target_type: string,
  populate_notification_fn: (notification: IMyModel) => any;
  comment_reply_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface IGenericCommentRepliesService {
  get_comment_reply_by_id: ExpressRouteEndHandler,
  get_comment_replies_count: ExpressRouteEndHandler,
  get_comment_replies_all: ExpressRouteEndHandler,
  get_comment_replies: ExpressRouteEndHandler,
  create_comment_reply: ExpressRouteEndHandler,
  update_comment_reply: ExpressRouteEndHandler,
  delete_comment_reply: ExpressRouteEndHandler,
}

export function createCommonGenericModelCommentRepliesService (
  params: ICreateCommonGenericModelCommentRepliesService
) {
  return class {
    /** Request Handlers */
  
    static async get_comment_reply_by_id(request: Request, response: Response) {
      const reply_model = response.locals.reply_model;
      return response.status(HttpStatusCode.OK).json({
        data: reply_model
      });
    }
  
    static async get_comment_replies_count(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const replies_count = await params.comment_reply_model.count({ where: { comment_id } });
      return response.status(HttpStatusCode.OK).json({
        data: replies_count
      });
    }
  
    static async get_comment_replies_all(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const replys = await CommonRepo.getAll(
        params.comment_reply_model,
        'comment_id',
        comment_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: replys
      });
    }
  
    static async get_comment_replies(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const reply_id = parseInt(request.params.reply_id, 10);
      const businesses = await CommonRepo.paginateTable(
        params.comment_reply_model,
        'comment_id',
        comment_id,
        reply_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: businesses
      });
    }
  
    static async create_comment_reply(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const comment_model = response.locals.comment_model as IMyModel;
      let body: string = request.body.body;
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reply body is required`
        });
      }
      const reply_model = await params.comment_reply_model.create({ body, comment_id, owner_id: you.id });
      const reply = await params.comment_reply_model.findOne({
        where: { id: reply_model.get('id') },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });

      create_notification({
        from_id: you.id,
        to_id: comment_model.get('owner_id'),
        micro_app: params.micro_app,
        event: params.create_model_event,
        target_type: params.target_type,
        target_id: reply_model.get('id'),
      }).then(async (notification_model) => {
        const notification = await params.populate_notification_fn(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: comment_model.get('owner_id'),
          event: params.create_model_event,
          data: {
            data: reply,
            message: `New reply`,
            user: you,
            notification,
          }
        });
      });

      return response.status(HttpStatusCode.OK).json({
        message: `Reply created successfully`,
        data: reply
      });
    }
  
    static async update_comment_reply(request: Request, response: Response) {
      const you: IUser = response.locals.you; 
      let body: string = request.body.body;
      const reply_id = parseInt(request.params.reply_id, 10);
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reply body is required`
        });
      }
      const updates = await params.comment_reply_model.update({ body }, { where: { id: reply_id } });
      const reply = await params.comment_reply_model.findOne({
        where: { id: reply_id },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });
      return response.status(HttpStatusCode.OK).json({
        message: `Reply updated successfully`,
        updates: updates,
        data: reply
      });
    }
  
    static async delete_comment_reply(request: Request, response: Response) {
      const reply_id = parseInt(request.params.reply_id, 10);
      const deletes = await params.comment_reply_model.destroy({ where: { id: reply_id } });
      return response.status(HttpStatusCode.OK).json({
        message: `Reply deleted successfully`,
        deletes
      });
    }
  } as IGenericCommentRepliesService;
}