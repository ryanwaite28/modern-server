import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IMyModel } from '../model-types';
import { get_comment_by_id as get_post_comment_by_id } from '../repos/post-comments.repo';
import { get_comment_by_id as get_recipe_comment_by_id } from '../repos/recipe-comments.repo';


export async function PostCommentExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const comment_id = parseInt(request.params.comment_id, 10);
  const comment_model = await get_post_comment_by_id(comment_id);
  if (!comment_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Comment not found`
    });
  }
  response.locals.comment_model = comment_model;
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

export async function IsCommentOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const comment_model = <IMyModel> response.locals.comment_model;
  const isOwner: boolean = response.locals.you.id === comment_model.get('owner_id');
  if (!isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `Not comment owner`
    });
  }
  return next();
}