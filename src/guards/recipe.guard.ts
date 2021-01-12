import { NextFunction, Request, Response } from 'express';
import { get_recipe_by_id } from '../repos/recipes.repo';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { IMyModel } from '../model-types';


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