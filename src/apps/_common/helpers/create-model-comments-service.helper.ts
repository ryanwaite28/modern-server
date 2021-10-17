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
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';
import { ServiceMethodAsyncResult, ServiceMethodResult } from '../types/common.types';



export interface ICreateCommonGenericModelCommentsService {
  base_model_name: string,
  micro_app: string,
  create_model_event: string,
  target_type: string,
  populate_notification_fn: (notification: IMyModel) => any;
  comment_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface ICommonGenericCommentsService {
  get_comment_by_id: (comment_id: number) => ServiceMethodAsyncResult,
  get_comments_count: (model_id: number) => ServiceMethodAsyncResult,
  get_comments_all: (model_id: number) => ServiceMethodAsyncResult,
  get_comments: (model_id: number, comment_id?: number) => ServiceMethodAsyncResult,
  create_comment: (opts: {
    body: string,
    base_model: IMyModel,
    you: IUser,
    ignoreNotification?: boolean,
    owner_field?: string,
  }) => ServiceMethodAsyncResult,
  update_comment: (opts: {
    body: string,
    comment_id: number,
  }) => ServiceMethodAsyncResult,
  delete_comment: (comment_id: number) => ServiceMethodAsyncResult,
}

export function createCommonGenericModelCommentsService(
  params: ICreateCommonGenericModelCommentsService
) {
  const model_id_field = params.base_model_name + '_id';

  let Class: ICommonGenericCommentsService;
  Class = class {
    
    /** Request Handlers */
  
    static async get_comment_by_id(comment_id: number) {
      const comment_model = params.comment_model.findOne({
        where: { id: comment_id },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }],
      });
      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: comment_model
        }
      };
      return results;
    }
  
    static async get_comments_count(model_id: number) {
      const comments_count = await params.comment_model.count({ where: { [model_id_field]: model_id } });
      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: comments_count
        }
      };
      return results;
    }
  
    static async get_comments_all(model_id: number) {
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
      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: comments
        }
      };
      return results;
    }
  
    static async get_comments(model_id: number, comment_id?: number) {
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
      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: comments
        }
      };
      return results;
    }
  
    static async create_comment(opts: {
      you: IUser,
      base_model: IMyModel,
      body: string,
      ignoreNotification?: boolean,
      owner_field?: string;
    }) {
      const { you, body, base_model, ignoreNotification } = opts;
      const base_model_owner_field = opts.owner_field || 'owner_id';
      const model_id: number = base_model.get('id');
      if (!body) {
        const results: ServiceMethodResult = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Comment body is required`
          }
        };
        return results;
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

      if (!ignoreNotification) {
        create_notification({
          from_id: you.id,
          to_id: base_model.get(base_model_owner_field),
          micro_app: params.micro_app,
          event: params.create_model_event,
          target_type: params.target_type,
          target_id: comment_model.get('id'),
        }).then(async (notification_model) => {
          const notification = await params.populate_notification_fn(notification_model);
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: base_model.get(base_model_owner_field),
            event: params.create_model_event,
            data: {
              data: comment,
              message: `New comment`,
              user: you,
              notification,
            }
          });
        });
      }

      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Comment created successfully`,
          data: comment
        }
      };
      return results;
    }
  
    static async update_comment(opts: {
      body: string,
      comment_id: number,
    }) {
      const { body, comment_id } = opts;
      if (!body) {
        const results: ServiceMethodResult = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Comment body is required`,
          }
        };
        return results;
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
      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Comment updated successfully`,
          data: {
            updates,
            comment
          }
        }
      };
      return results;
    }
  
    static async delete_comment(comment_id: number) {
      const deletes = await params.comment_model.destroy({ where: { id: comment_id } });
      const results: ServiceMethodResult = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Comment updated successfully`,
          data: deletes
        }
      };
      return results;
    }
  };

  return Class;
}