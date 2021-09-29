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
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ExpressRouteEndHandler } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';



export interface ICreateCommonGenericModelCommentsService {
  base_model_name: string,
  micro_app: string,
  create_model_event: string,
  target_type: string,
  populate_notification_fn: (notification: IMyModel) => any;
  comment_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface ICommonGenericCommentsService {

  get_comment_by_id: ExpressRouteEndHandler,
  get_comments_count: ExpressRouteEndHandler,
  get_comments_all: ExpressRouteEndHandler,
  get_comments: ExpressRouteEndHandler,
  create_comment: ExpressRouteEndHandler,
  update_comment: ExpressRouteEndHandler,
  delete_comment: ExpressRouteEndHandler,
}

export function createCommonGenericModelCommentsService(
  params: ICreateCommonGenericModelCommentsService
) {
  const model_id_field = params.base_model_name + '_id';
  const model_field = params.base_model_name + '_model';

  return class {
    
    /** Request Handlers */
  
    static async get_comment_by_id(request: Request, response: Response) {
      const comment_model = response.locals.comment_model;
      return response.status(HttpStatusCode.OK).json({
        data: comment_model
      });
    }
  
    static async get_comments_count(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const comments_count = await params.comment_model.count({ where: { [model_id_field]: model_id } });
      return response.status(HttpStatusCode.OK).json({
        data: comments_count
      });
    }
  
    static async get_comments_all(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const comments = await CommonRepo.getAll(
        params.comment_model,
        model_id_field,
        model_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: comments
      });
    }
  
    static async get_comments(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const comment_id = parseInt(request.params.comment_id, 10) || undefined;
      const comments = await CommonRepo.paginateTable(
        params.comment_model,
        model_id_field,
        model_id,
        comment_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: comments
      });
    }
  
    static async create_comment(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const parent_model = response.locals[model_field];

      let body: string = request.body.body;
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Comment body is required`
        });
      }
      const comment_model = await params.comment_model.create({ body, [model_id_field]: model_id, owner_id: you.id });
      const comment = await params.comment_model.findOne({
        where: { id: comment_model.get('id') },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });

      create_notification({
        from_id: you.id,
        to_id: parent_model.get('owner_id'),
        micro_app: params.micro_app,
        event: params.create_model_event,
        target_type: params.target_type,
        target_id: comment_model.get('id'),
      }).then(async (notification_model) => {
        const notification = await params.populate_notification_fn(notification_model);
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id: parent_model.get('owner_id'),
          event: params.create_model_event,
          data: {
            data: comment,
            message: `New comment`,
            user: you,
            notification,
          }
        });
      });
      
      return response.status(HttpStatusCode.OK).json({
        message: `Comment created successfully`,
        data: comment
      });
    }
  
    static async update_comment(request: Request, response: Response) {
      const you: IUser = response.locals.you; 
      let body: string = request.body.body;
      const comment_id = parseInt(request.params.comment_id, 10);
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Comment body is required`
        });
      }
      const updates = await params.comment_model.update({ body }, { where: { id: comment_id } });
      const comment = await params.comment_model.findOne({
        where: { id: comment_id },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });
      return response.status(HttpStatusCode.OK).json({
        message: `Comment updated successfully`,
        updates: updates,
        data: comment
      });
    }
  
    static async delete_comment(request: Request, response: Response) {
      const comment_id = parseInt(request.params.comment_id, 10);
      const deletes = await params.comment_model.destroy({ where: { id: comment_id } });
      return response.status(HttpStatusCode.OK).json({
        message: `Comment deleted successfully`,
        deletes
      });
    }
  } as ICommonGenericCommentsService;
}