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
import { ExpressRouteEndHandler } from '../types/common.types';

export interface ICreateCommonGenericModelReactionsService {
  base_model_name: string,
  reaction_model: MyModelStatic | MyModelStaticGeneric<IMyModel>,
}

export interface IGenericModelReactionsService {
  get_user_reaction: ExpressRouteEndHandler,
  toggle_user_reaction: ExpressRouteEndHandler,
  get_model_reactions_counts: ExpressRouteEndHandler,
  get_model_reactions_all: ExpressRouteEndHandler,
  get_model_reactions: ExpressRouteEndHandler,
}

export function createCommonGenericModelReactionsService (
  params: ICreateCommonGenericModelReactionsService
) {
  const model_id_field = params.base_model_name + '_id';

  return class {
    static async get_user_reaction(request: Request, response: Response) {
      const user_id: number = parseInt(request.params.user_id, 10);
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const model_reaction = await params.reaction_model.findOne({
        where: {
          model_id,
          owner_id: user_id
        }
      });
      return response.status(HttpStatusCode.OK).json({
        data: model_reaction
      });
    }
  
    static async toggle_user_reaction(request: Request, response: Response) {
      const you: IUser = response.locals.you;
      const model_id: number = parseInt(request.params[model_id_field], 10);
  
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
  
      let model_reaction = await params.reaction_model.findOne({
        where: {
          model_id,
          owner_id: you.id
        }
      });
  
      if (!model_reaction) {
        // user has no reaction to reply; create it
        model_reaction = await params.reaction_model.create({
          reaction,
          model_id,
          owner_id: you.id
        });
      } else if (model_reaction.get('reaction') === reaction) {
        // user's reaction is same to request; they intended to undo the reaction
        await model_reaction.destroy();
        model_reaction = null;
      } else {
        // user's reaction is different to request; they intended to change the reaction
        model_reaction.reaction = reaction;
        await model_reaction.save({ fields: ['reaction'] });
      }
  
  
      return response.status(HttpStatusCode.OK).json({
        message: `Toggled reply reaction`,
        data: model_reaction
      });
    }
  
    static async get_model_reactions_counts(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
  
      const like_count = await params.reaction_model.count({ where: { model_id, reaction: COMMON_REACTION_TYPES.LIKE } });
      const love_count = await params.reaction_model.count({ where: { model_id, reaction: COMMON_REACTION_TYPES.LOVE } });
      const idea_count = await params.reaction_model.count({ where: { model_id, reaction: COMMON_REACTION_TYPES.IDEA } });
      const confused_count = await params.reaction_model.count({ where: { model_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });
  
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
  
    static async get_model_reactions_all(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const model_reactions = await CommonRepo.getAll(
        params.reaction_model,
        'reply_id',
        model_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: model_reactions
      });
    }
  
    static async get_model_reactions(request: Request, response: Response) {
      const model_id: number = parseInt(request.params[model_id_field], 10);
      const reaction_id: number = parseInt(request.params.reaction_id, 10);
      const model_reactions = await CommonRepo.paginateTable(
        params.reaction_model,
        'reply_id',
        model_id,
        reaction_id,
        [{
          model: Users,
          as: 'owner',
          attributes: user_attrs_slim
        }]
      );
      return response.status(HttpStatusCode.OK).json({
        data: model_reactions
      });
    }
  } as IGenericModelReactionsService;
}