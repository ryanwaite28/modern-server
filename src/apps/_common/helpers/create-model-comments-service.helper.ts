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
import { createCommonGenericModelReactionsService, IGenericModelReactionsService } from './create-model-reactions-service.helper';
import { ExpressRouteEndHandler } from '../types/common.types';



export interface ICreateCommonGenericModelCommentsService {
  model_name: string,
  create_reactions_service?: boolean,
  comment_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  comment_reaction_model?: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface IGenericCommentsService {
  reactionsService?: IGenericModelReactionsService;

  get_comment_by_id: ExpressRouteEndHandler,
  get_comments_count: ExpressRouteEndHandler,
  get_comments_all: ExpressRouteEndHandler,
  get_comments: ExpressRouteEndHandler,
  create_comment: ExpressRouteEndHandler,
  update_comment: ExpressRouteEndHandler,
  delete_comment: ExpressRouteEndHandler,

  get_user_reaction: ExpressRouteEndHandler,
  toggle_user_reaction: ExpressRouteEndHandler,
  get_comment_reactions_counts: ExpressRouteEndHandler,
  get_comment_reactions_all: ExpressRouteEndHandler,
  get_comment_reactions: ExpressRouteEndHandler,
}

export function createCommonGenericModelCommentsService(
  params: ICreateCommonGenericModelCommentsService
) {
  const model_id_field = params.model_name + '_id';
  const reactionsService = params.create_reactions_service
    ? createCommonGenericModelReactionsService({
        base_model_name: 'comment',
        reaction_model: params.comment_reaction_model!
      })
    : {} as IGenericModelReactionsService;

  return class {
    static readonly reactionsService = reactionsService;
    
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


    // Comment Reactions

    static get_user_reaction = reactionsService.get_user_reaction;
  
    static toggle_user_reaction = reactionsService.toggle_user_reaction;
  
    static get_comment_reactions_counts = reactionsService.get_model_reactions_counts;
  
    static get_comment_reactions_all = reactionsService.get_model_reactions_all;
  
    static get_comment_reactions = reactionsService.get_model_reactions;
  } as IGenericCommentsService;
}