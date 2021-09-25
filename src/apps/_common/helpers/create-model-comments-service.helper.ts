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
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';
import {
  IMyModel,
  MyModelStatic,
  MyModelStaticGeneric
} from '../models/common.model-types';



export interface ICreateCommonGenericModelCommentsService {
  model_name: string,
  comment_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
  comment_reaction_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export function createCommonGenericModelCommentsService(
  params: ICreateCommonGenericModelCommentsService
) {
  const model_id_field = params.model_name + '_id';

  return class {
    /** Request Handlers */
  
    static async main(request: Request, response: Response) {
      return response.status(HttpStatusCode.OK).json({
        msg: `${params.model_name} comments router`
      });
    }
  
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
  
    static async get_user_reaction(request: Request, response: Response) {
      const user_id: number = parseInt(request.params.user_id, 10);
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const comment_reaction = await params.comment_reaction_model.findOne({
        where: {
          comment_id,
          owner_id: user_id
        }
      });
      return response.status(HttpStatusCode.OK).json({
        data: comment_reaction
      });
    }
  
    static async toggle_user_reaction(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const comment_id: number = parseInt(request.params.comment_id, 10);
  
      const reaction = request.body.reaction;
      if (!reaction) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reaction type is required`
        });
      }
      if (!(typeof (reaction) === 'string')) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reaction type is invalid`
        });
      }
      if (!(reaction in COMMON_REACTION_TYPES)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          message: `Reaction type is invalid`
        });
      }
  
      let comment_reaction = await params.comment_reaction_model.findOne({
        where: {
          comment_id,
          owner_id: you.id
        }
      });
  
      if (!comment_reaction) {
        // user has no reaction to comment; create it
        comment_reaction = await params.comment_reaction_model.create(<any> {
          reaction,
          comment_id,
          owner_id: you.id
        });
      } else if (comment_reaction.get('reaction') === reaction) {
        // user's reaction is same to request; they intended to undo the reaction
        await comment_reaction.destroy();
        comment_reaction = null;
      } else {
        // user's reaction is different to request; they intended to change the reaction
        comment_reaction.reaction = reaction;
        await comment_reaction.save({ fields: ['reaction'] });
      }
  
  
      return response.status(HttpStatusCode.OK).json({
        message: `Toggled comment reaction`,
        data: comment_reaction
      });
    }
  
    static async get_comment_reactions_counts(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
  
      const like_count = await params.comment_reaction_model.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.LIKE } });
      const love_count = await params.comment_reaction_model.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.LOVE } });
      const idea_count = await params.comment_reaction_model.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.IDEA } });
      const confused_count = await params.comment_reaction_model.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });
  
      const total_count: number = [
        like_count,
        love_count,
        idea_count,
        confused_count,
      ].reduce((acc, cur) => (acc + cur));
  
      return response.status(HttpStatusCode.OK).json({
        data: {
          total_count,
          like_count,
          love_count,
          idea_count,
          confused_count,
        }
      });
    }
  
    static async get_comment_reactions_all(request: Request, response: Response) {
      const comment_id: number = parseInt(request.params.comment_id, 10);
      const comment_reactions = await CommonRepo.getAll(
        params.comment_reaction_model,
        'comment_id',
        comment_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: comment_reactions
      });
    }
  
    static async get_comment_reactions(request: Request, response: Response) {
      const comment_id = parseInt(request.params.comment_id, 10);
      const comment_reaction_id: number = parseInt(request.params.comment_reaction_id, 10);
      const comment_reactions = await CommonRepo.paginateTable(
        params.comment_reaction_model,
        'comment_id',
        comment_id,
        comment_reaction_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: comment_reactions
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
  }
}