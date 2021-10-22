import { UploadedFile } from 'express-fileupload';
import {
  Request,
  Response,
} from 'express';
import {
  HttpStatusCode
} from '../../_common/enums/http-codes.enum';
import {
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import { IRecipeModel } from '../../_common/models/common.model-types';
import { ExpressResponse, ServiceMethodResults } from 'src/apps/_common/types/common.types';
import { RecipesService } from '../services/recipes.service';

export class RecipesRequestHandler {

  static async get_recipe_by_id(request: Request, response: Response): ExpressResponse {
    const recipe_model = response.locals.recipe_model;
    return response.status(HttpStatusCode.OK).json({
      data: recipe_model
    });
  }

  static async get_user_recipes_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await RecipesService.get_user_recipes_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_recipes(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const recipe_id = parseInt(request.params.recipe_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await RecipesService.get_user_recipes(user_id, recipe_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async create_recipe(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      data: JSON.parse(request.body.payload) as PlainObject,
      recipe_image: request.files && (<UploadedFile> request.files.recipe_image) as UploadedFile | undefined,
    };

    const serviceMethodResults: ServiceMethodResults = await RecipesService.create_recipe(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_recipe(request: Request, response: Response): ExpressResponse {
    const opts = {
      you: response.locals.you as IUser,
      recipe_model: response.locals.recipe_model as IRecipeModel,
      data: JSON.parse(request.body.payload) as PlainObject,
      recipe_image: request.files && (<UploadedFile> request.files.recipe_image) as UploadedFile | undefined,
    };

    const serviceMethodResults: ServiceMethodResults = await RecipesService.update_recipe(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async update_recipe_ingredient(request: Request, response: Response): ExpressResponse {
    const opts = {
      ingredient_id: parseInt(request.params.ingredient_id, 10) as number,
      data: {
        name: request.body.name,
        notes: request.body.notes,
      }
    };

    const serviceMethodResults: ServiceMethodResults = await RecipesService.update_recipe_ingredient(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_recipe(request: Request, response: Response): ExpressResponse {
    const recipe_model: IRecipeModel = response.locals.recipe_model;

    const serviceMethodResults: ServiceMethodResults = await RecipesService.delete_recipe(undefined, recipe_model);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async delete_recipe_ingredient(request: Request, response: Response): ExpressResponse {
    const ingredient_id: number = parseInt(request.params.ingredient_id, 10);

    const serviceMethodResults: ServiceMethodResults = await RecipesService.delete_recipe_ingredient(ingredient_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
