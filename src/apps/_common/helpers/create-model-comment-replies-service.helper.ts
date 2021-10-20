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
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';
import { ServiceMethodResults, ServiceMethodAsyncResults } from '../types/common.types';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from '../services/socket-events-handlers-by-app/common.socket-event-handler';
import { Includeable } from 'sequelize/types';


export interface ICreateCommonGenericModelCommentRepliesService {
  micro_app: string,
  create_model_event: string,
  target_type: string,
  populate_notification_fn: (notification: IMyModel) => any;
  comment_reply_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface IGenericCommentRepliesService {
  get_comment_reply_by_id: (reply_id: number) => ServiceMethodAsyncResults,
  get_comment_replies_count: (comment_id: number) => ServiceMethodAsyncResults,
  get_comment_replies_all: (comment_id: number) => ServiceMethodAsyncResults,
  get_comment_replies: (comment_id: number, reply_id?: number) => ServiceMethodAsyncResults,
  create_comment_reply: (opts: {
    body: string,
    comment_model: IMyModel,
    you: IUser,
    ignoreNotification?: boolean,
  }) => ServiceMethodAsyncResults,
  update_comment_reply: (opts: {
    body: string,
    reply_id: number,
  }) => ServiceMethodAsyncResults,
  delete_comment_reply: (reply_id: number) => ServiceMethodAsyncResults,
}

export function createCommonGenericModelCommentRepliesService (
  params: ICreateCommonGenericModelCommentRepliesService
) {

  let Class: IGenericCommentRepliesService;
  Class = class {
    /** Request Handlers */
  
    static async get_comment_reply_by_id(reply_id: number) {
      const reply_model = params.comment_reply_model.findOne({
        where: { id: reply_id },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }],
      });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: reply_model
        }
      };
      return serviceMethodResults;
    }
  
    static async get_comment_replies_count(comment_id: number) {
      const replies_count = await params.comment_reply_model.count({ where: { comment_id } });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: replies_count
        }
      };
      return serviceMethodResults;
    }
  
    static async get_comment_replies_all(comment_id: number) {
      const replies = await CommonRepo.getAll(
        params.comment_reply_model,
        'comment_id',
        comment_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: replies
        }
      };
      return serviceMethodResults;
    }
  
    static async get_comment_replies(comment_id: number, reply_id?: number) {
      const replies = await CommonRepo.paginateTable(
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
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          data: replies
        }
      };
      return serviceMethodResults;
    }
  
    static async create_comment_reply(opts: {
      body: string,
      comment_model: IMyModel,
      you: IUser,
      ignoreNotification?: boolean,
    }) {
      const { body, you, comment_model, ignoreNotification } = opts;
      if (!body) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Reply body is required`
          }
        };
        return serviceMethodResults;
      }
      const comment_id = comment_model.get('id');
      const reply_model = await params.comment_reply_model.create({ body, comment_id, owner_id: you.id });
      const reply = await params.comment_reply_model.findOne({
        where: { id: reply_model.get('id') },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });

      if (!ignoreNotification) {
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
      }

      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `reply created`,
          data: reply
        }
      };
      return serviceMethodResults;
    }
  
    static async update_comment_reply(opts: {
      body: string,
      reply_id: number,
    }) {
      const { body, reply_id } = opts;
      if (!body) {
        const serviceMethodResults: ServiceMethodResults = {
          status: HttpStatusCode.BAD_REQUEST,
          error: true,
          info: {
            message: `Reply body is required`
          }
        };
        return serviceMethodResults;
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
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Reply updated successfully`,
          data: {
            updates,
            reply
          }
        }
      };
      return serviceMethodResults;
    }
  
    static async delete_comment_reply(reply_id: number) {
      const deletes = await params.comment_reply_model.destroy({ where: { id: reply_id } });
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `Reply deleted successfully`,
          data: {
            deletes
          }
        }
      };
      return serviceMethodResults;
    }
  };

  return Class;
}