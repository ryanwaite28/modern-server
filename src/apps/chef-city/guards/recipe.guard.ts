import { NextFunction, Request, Response } from 'express';
import { get_recipe_by_id } from '../repos/recipes.repo';
import { IMyModel } from '../../_common/models/common.model-types';
import { HttpStatusCode } from '../../_common/enums/http-codes.enum';
import { get_comment_by_id as get_recipe_comment_by_id } from '../repos/recipe-comments.repo';
import {
  get_reply_by_id as get_recipe_comment_reply_by_id
} from '../repos/recipe-comment-replies.repo';

export async function RecipeExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const recipe_id = parseInt(request.params.recipe_id, 10);
  const recipe_model = await get_recipe_by_id(recipe_id);
  if (!recipe_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Recipe not found`
    });
  }
  response.locals.recipe_model = recipe_model;
  return next();
}

export async function RecipeCommentExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const comment_id = parseInt(request.params.comment_id, 10);
  const comment_model = await get_recipe_comment_by_id(comment_id);
  if (!comment_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Comment not found`
    });
  }
  response.locals.comment_model = comment_model;
  return next();
}

export async function RecipeCommentReplyExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const reply_id = parseInt(request.params.reply_id, 10);
  const reply_model = await get_recipe_comment_reply_by_id(reply_id);
  if (!reply_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Reply not found`
    });
  }
  response.locals.reply_model = reply_model;
  return next();
}

export async function IsRecipeOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const recipe_model = <IMyModel> response.locals.recipe_model;
  const isOwner: boolean = response.locals.you.id === recipe_model.get('creator_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not recipe creator`
    });
  }
  return next();
}