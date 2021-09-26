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
import { createCommonGenericModelReactionsService } from './create-model-reactions-service.helper';


export interface ICreateCommonGenericModelCommentRepliesService {
  model_name: string,
  reply_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  reply_reaction_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export function createCommonGenericModelCommentRepliesService (
  params: ICreateCommonGenericModelCommentRepliesService
) {
  const reactionsService = createCommonGenericModelReactionsService({
    base_model_name: 'reply',
    reaction_model: params.reply_reaction_model
  });
  return class {
    static readonly reactionsService = reactionsService;

    /** Request Handlers */
  
    static async main(request: Request, response: Response) {
      return response.status(HttpStatusCode.OK).json({
        msg: `${params.model_name} comment replies router`
      });
    }
  
    static async get_reply_by_id(request: Request, response: Response) {
      const reply_model = response.locals.reply_model;
      return response.status(HttpStatusCode.OK).json({
        data: reply_model
      });
    }
  
    static async get_comment_replies_count(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const replies_count = await params.reply_model.count({ where: { comment_id } });
      return response.status(HttpStatusCode.OK).json({
        data: replies_count
      });
    }
  
    static async get_comment_replies_all(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const replys = await CommonRepo.getAll(
        params.reply_model,
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
        params.reply_model,
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
  
    static async create_reply(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const comment_id: number = parseInt(request.params.comment_id, 10);
      let body: string = request.body.body;
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reply body is required`
        });
      }
      const reply_model = await params.reply_model.create({ body, comment_id, owner_id: you.id });
      const reply = await params.reply_model.findOne({
        where: { id: reply_model.get('id') },
        include: [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      });
      return response.status(HttpStatusCode.OK).json({
        message: `Reply created successfully`,
        data: reply
      });
    }
  
    static async update_reply(request: Request, response: Response) {
      const you: IUser = response.locals.you; 
      let body: string = request.body.body;
      const reply_id = parseInt(request.params.reply_id, 10);
      if (!body) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reply body is required`
        });
      }
      const updates = await params.reply_model.update({ body }, { where: { id: reply_id } });
      const reply = await params.reply_model.findOne({
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
  
    static async delete_reply(request: Request, response: Response) {
      const reply_id = parseInt(request.params.reply_id, 10);
      const deletes = await params.reply_model.destroy({ where: { id: reply_id } });
      return response.status(HttpStatusCode.OK).json({
        message: `Reply deleted successfully`,
        deletes
      });
    }



    // Reply Reactions

    static get_user_reaction = reactionsService.get_user_reaction;
  
    static toggle_user_reaction = reactionsService.toggle_user_reaction;
  
    static get_reply_reactions_counts = reactionsService.get_model_reactions_counts;
  
    static get_reply_reactions_all = reactionsService.get_model_reactions_all;
  
    static get_reply_reactions = reactionsService.get_model_reactions;
  }
}