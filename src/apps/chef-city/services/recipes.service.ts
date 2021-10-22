import { UploadedFile } from 'express-fileupload';
import {
  IUser, PlainObject,
} from '../../_common/interfaces/common.interface';
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as RecipesRepo from '../repos/recipes.repo';
import {
  user_attrs_slim,
  youtube_regex,
  validateAndUploadImageFile,
  check_model_args,
  createGenericServiceMethodError,
  createGenericServiceMethodSuccess
} from '../../_common/common.chamber';
import { delete_cloudinary_image } from '../../../cloudinary-manager';
import { Recipes, RecipeIngredients } from '../../chef-city/models/recipe.model';
import { Users } from '../../_common/models/user.model';
import { IMyModel, IRecipeModel } from '../../_common/models/common.model-types';
import { ServiceMethodAsyncResults, ServiceMethodResults } from 'src/apps/_common/types/common.types';

export class RecipesService {

  static async get_recipe_by_id(recipe_id: number): ServiceMethodAsyncResults {
    const recipe_model: IRecipeModel | null = await RecipesRepo.get_recipe_by_id(recipe_id);

    return createGenericServiceMethodSuccess(undefined, recipe_model);
  }

  static async get_user_recipes_all(user_id: number): ServiceMethodAsyncResults {
    const recipes = await CommonRepo.getAll(
      Recipes,
      'creator_id',
      user_id,
      [{
        model: Users,
        as: 'creator',
        attributes: user_attrs_slim
      }, {
        model: RecipeIngredients,
        as: 'ingredients'
      }]
    );

    return createGenericServiceMethodSuccess(undefined, recipes);
  }

  static async get_user_recipes(user_id: number, recipe_id?: number): ServiceMethodAsyncResults {
    const recipes = await CommonRepo.paginateTable(
      Recipes,
      'creator_id',
      user_id,
      recipe_id,
      [{
        model: Users,
        as: 'creator',
        attributes: user_attrs_slim
      }, {
        model: RecipeIngredients,
        as: 'ingredients'
      }]
    );

    return createGenericServiceMethodSuccess(undefined, recipes);
  }

  static async create_recipe(opts: {
    you: IUser,
    recipe_image: UploadedFile | undefined,
    data: {
      title: string,
      description: string,
      youtube_link: string,
      tags: string[],
      ingredients: { name: string; notes: string; }[],
    } | PlainObject,
  }): ServiceMethodAsyncResults {
    
    let { you, data, recipe_image } = opts;
    let {
      title,
      tags,
      description,
      youtube_link,
      ingredients,
    } = data;

    if (!title) {
      return createGenericServiceMethodError(`Recipe title is required`);
    }
    if (!description) {
      return createGenericServiceMethodError(`Recipe description is required`);
    }

    if (!tags) {
      tags = [];
    }
    else {
      const all_tags_valid = tags.length === 0 || tags.every((tag: string | any) => !!tag && (typeof (tag) === 'string'));
      if (!all_tags_valid) {
        return createGenericServiceMethodError(`All elements in tags list must be a string`);
      }
      if (tags.length > 20) {
        return createGenericServiceMethodError(`Maximum of tags list is 20`);
      }
    }

    if (!ingredients) {
      ingredients = [];
    }
    else {
      const all_ingredients_valid = ingredients.length === 0 || ingredients.every((i: PlainObject<string>) => {
        return (
          i.hasOwnProperty('name') && i.hasOwnProperty('notes') &&
          (typeof (i.name) === 'string') && (typeof (i.notes) === 'string')
        );
      });
      if (!all_ingredients_valid) {
        return createGenericServiceMethodError(`All ingredients in tags list must be an object with name (string) and notes (string) properties`);
      }
    }

    const imageValidation = await validateAndUploadImageFile(recipe_image, {
      treatNotFoundAsError: false,
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const image_id = !imageValidation.error ? imageValidation.info.data.image_id : '';
    const image_link = !imageValidation.error ? imageValidation.info.data.image_link : '';

    if (youtube_link) {
      if (!youtube_regex.test(youtube_link)) {
        return createGenericServiceMethodError(`Youtube link is invalid...`);
      }
    }

    const recipe_model = await RecipesRepo.create_recipe({
      title,
      description,
      tags,
      youtube_link,
      ingredients,
      image_id,
      image_link,

      creator_id: you.id,
      visibility: '',
    });

    return createGenericServiceMethodSuccess(`Recipe created successfully`, recipe_model);
  }

  static async update_recipe(opts: {
    you: IUser,
    recipe_id?: number,
    recipe_model?: IMyModel,
    recipe_image: UploadedFile | undefined,
    data: PlainObject | {
      title: string,
      description: string,
      youtube_link: string,
      tags: string[],
      ingredients: { name: string; notes: string; }[],
    }
  }): ServiceMethodAsyncResults {
    let { you, recipe_image, recipe_id, recipe_model, data } = opts;
    
    const checkModelResults: ServiceMethodResults<IMyModel> = await check_model_args({
      model_id: recipe_id,
      model: recipe_model,
      model_name: `recipe`,
      get_model_fn: RecipesRepo.get_recipe_by_id,
    });
    if (checkModelResults.error) {
      return checkModelResults;
    }

    recipe_id = checkModelResults.info.data!.get('id');
    
    let title: string = data.title;
    let description: string = data.description;
    let youtube_link: string = data.youtube_link;
    let tags: string[] = data.tags;
    let ingredients: { name: string; notes: string; }[] = data.ingredients;

    if (!title) {
      return createGenericServiceMethodError(`Recipe title is required`);
    }
    if (!description) {
      return createGenericServiceMethodError(`Recipe description is required`);
    }

    if (!tags) {
      tags = [];
    }
    else {
      const all_tags_valid = tags.length === 0 || tags.every(tag => !!tag && (typeof (tag) === 'string'));
      if (!all_tags_valid) {
        return createGenericServiceMethodError(`All elements in tags list must be a string`);
      }
      if (tags.length > 20) {
        return createGenericServiceMethodError(`Maximum of tags list is 20`);
      }
    }

    if (!ingredients) {
      ingredients = [];
    }
    else {
      const all_ingredients_valid = ingredients.length === 0 || ingredients.every((i) => {
        return (
          i.hasOwnProperty('name') && i.hasOwnProperty('notes') &&
          (typeof (i.name) === 'string') && (typeof (i.notes) === 'string')
        );
      });
      if (!all_ingredients_valid) {
        return createGenericServiceMethodError(`All ingredients in tags list must be an object with name (string) and notes (string) properties`);
      }
    }

    const imageValidation = await validateAndUploadImageFile(recipe_image, {
      treatNotFoundAsError: false,
    });
    if (imageValidation.error) {
      return imageValidation;
    }

    const image_id = !imageValidation.error ? imageValidation.info.data.image_id : '';
    const image_link = !imageValidation.error ? imageValidation.info.data.image_link : '';

    if (youtube_link) {
      if (!youtube_regex.test(youtube_link)) {
        return createGenericServiceMethodError(`Youtube link is invalid...`);
      }
    }

    const updates = await RecipesRepo.update_recipe({
      title,
      description,
      tags,
      ingredients,
      youtube_link,
      visibility: '',
      image_id,
      image_link,
    }, recipe_id, you.id);

    const recipe = await RecipesRepo.get_recipe_by_id(recipe_id);

    return createGenericServiceMethodSuccess(`Recipe updated successfully`, {
      updates,
      recipe,
    });
  }

  static async update_recipe_ingredient(opts: {
    ingredient_id: number,
    data: PlainObject | {
      name: string,
      notes: string,
    }
  }): ServiceMethodAsyncResults {
    const updates = await RecipesRepo.update_recipe_ingredient({
      name: opts.data.name,
      notes: opts.data.notes,
    }, opts.ingredient_id);

    return createGenericServiceMethodSuccess(`Recipe ingredient updated successfully`, updates);
  }

  static async delete_recipe(recipe_id?: number, recipe_model?: IMyModel): ServiceMethodAsyncResults {
    const checkModelResults: ServiceMethodResults<IMyModel> = await check_model_args({
      model_id: recipe_id,
      model: recipe_model,
      model_name: `recipe`,
      get_model_fn: RecipesRepo.get_recipe_by_id,
    });
    if (checkModelResults.error) {
      return checkModelResults;
    }
    recipe_model = checkModelResults.info.data!;
    
    if (recipe_model.get('image_id')) {
      try {
        await delete_cloudinary_image(<string> recipe_model.get('image_id'));
      } catch (e) {
        console.log(e);
      }
    }
    const deletes = await RecipesRepo.delete_recipe(recipe_model.get('id'));

    return createGenericServiceMethodSuccess(`Recipe deleted successfully`, deletes);
  }

  static async delete_recipe_ingredient(ingredient_id: number): ServiceMethodAsyncResults {
    const deletes: number = await RecipesRepo.delete_recipe_ingredient(ingredient_id);

    return createGenericServiceMethodSuccess(`Recipe ingredient deleted successfully`, deletes);
  }
}