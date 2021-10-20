import {
  Request,
  Response,
} from 'express';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as RecipeCommentsRepo from '../../chef-city/repos/recipe-comments.repo';
import {
  user_attrs_slim
} from '../../_common/common.chamber';
import { RecipeComments, RecipeCommentReactions } from '../../chef-city/models/recipe.model';
import { Users } from '../../_common/models/user.model';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { IUser } from '../../_common/interfaces/common.interface';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';

export class RecipeCommentsService {
  /** Request Handlers */

  static async main(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      msg: 'comments router'
    });
  }

  static async get_comment_by_id(request: Request, response: Response): ExpressResponse {
    const comment_model = response.locals.comment_model;
    return response.status(HttpStatusCode.OK).json({
      data: comment_model
    });
  }

  static async get_recipe_comments_count(request: Request, response: Response): ExpressResponse {
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    const comments_count = await RecipeComments.count({ where: { recipe_id } });
    return response.status(HttpStatusCode.OK).json({
      data: comments_count
    });
  }

  static async get_recipe_comments_all(request: Request, response: Response): ExpressResponse {
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    const comments = await CommonRepo.getAll(
      RecipeComments,
      'recipe_id',
      recipe_id,
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

  static async get_recipe_comments(request: Request, response: Response): ExpressResponse {
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    const comment_id = parseInt(request.params.comment_id, 10) || undefined;
    const comments = await CommonRepo.paginateTable(
      RecipeComments,
      'recipe_id',
      recipe_id,
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

  static async get_user_reaction(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const comment_id: number = parseInt(request.params.comment_id, 10);
    const comment_reaction = await RecipeCommentReactions.findOne({
      where: {
        comment_id,
        owner_id: user_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: comment_reaction
    });
  }

  static async toggle_user_reaction(request: Request, response: Response): ExpressResponse {
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

    let comment_reaction = await RecipeCommentReactions.findOne({
      where: {
        comment_id,
        owner_id: you.id
      }
    });

    if (!comment_reaction) {
      // user has no reaction to comment; create it
      comment_reaction = await RecipeCommentReactions.create({
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

  static async get_comment_reactions_counts(request: Request, response: Response): ExpressResponse {
    const comment_id: number = parseInt(request.params.comment_id, 10);

    const like_count = await RecipeCommentReactions.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.LIKE } });
    const love_count = await RecipeCommentReactions.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.LOVE } });
    const idea_count = await RecipeCommentReactions.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.IDEA } });
    const confused_count = await RecipeCommentReactions.count({ where: { comment_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });

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

  static async get_comment_reactions_all(request: Request, response: Response): ExpressResponse {
    const comment_id: number = parseInt(request.params.comment_id, 10);
    const comment_reactions = await CommonRepo.getAll(
      RecipeCommentReactions,
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

  static async get_comment_reactions(request: Request, response: Response): ExpressResponse {
    const comment_id = parseInt(request.params.comment_id, 10);
    const comment_reaction_id: number = parseInt(request.params.comment_reaction_id, 10);
    const comment_reactions = await CommonRepo.paginateTable(
      RecipeCommentReactions,
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

  static async create_comment(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    let body: string = request.body.body;
    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Comment body is required`
      });
    }
    const comment_model = await RecipeCommentsRepo.create_comment({ body, recipe_id, owner_id: you.id });
    return response.status(HttpStatusCode.OK).json({
      message: `Comment created successfully`,
      data: comment_model
    });
  }

  static async update_comment(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 
    let body: string = request.body.body;
    const comment_id = parseInt(request.params.comment_id, 10);
    if (!body) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Comment body is required`
      });
    }
    const updates = await RecipeCommentsRepo.update_comment({ body }, comment_id);
    const comment = await RecipeCommentsRepo.get_comment_by_id(comment_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Comment updated successfully`,
      updates: updates,
      data: comment
    });
  }

  static async delete_comment(request: Request, response: Response): ExpressResponse {
    const comment_id = parseInt(request.params.comment_id, 10);
    const deletes = await RecipeCommentsRepo.delete_comment(comment_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Comment deleted successfully`,
      deletes
    });
  }
}