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
import * as CommonRepo from '../../_common/repos/_common.repo';
import * as RecipesRepo from '../repos/recipes.repo';
import {
  user_attrs_slim,
  allowedImages,
  youtube_regex
} from '../../_common/common.chamber';
import { delete_cloudinary_image, IStoreImage, store_image } from '../../../cloudinary-manager';
import { Photos } from '../../_common/models/photo.model';
import { Recipes, RecipePhotos, RecipeReactions, RecipeIngredients } from '../../chef-city/models/recipe.model';
import { Users } from '../../_common/models/user.model';
import { IRecipeModel } from '../../_common/models/common.model-types';
import { COMMON_REACTION_TYPES } from '../../_common/enums/common.enum';

export class RecipesService {
  static async main(request: Request, response: Response): ExpressResponse {
    return response.status(HttpStatusCode.OK).json({
      msg: 'recipes router'
    });
  }

  static async get_recipe_by_id(request: Request, response: Response): ExpressResponse {
    const recipe_model = response.locals.recipe_model;
    return response.status(HttpStatusCode.OK).json({
      data: recipe_model
    });
  }

  static async get_user_recipes_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
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
    return response.status(HttpStatusCode.OK).json({
      data: recipes
    });
  }

  static async get_user_recipes(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const recipe_id = parseInt(request.params.recipe_id, 10);
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
    return response.status(HttpStatusCode.OK).json({
      data: recipes
    });
  }

  static async get_user_reaction(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    const recipe_reaction = await RecipeReactions.findOne({
      where: {
        recipe_id,
        owner_id: user_id
      }
    });
    return response.status(HttpStatusCode.OK).json({
      data: recipe_reaction
    });
  }

  static async toggle_user_reaction(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const recipe_id: number = parseInt(request.params.recipe_id, 10);

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

    let recipe_reaction = await RecipeReactions.findOne({
      where: {
        recipe_id,
        owner_id: you.id
      }
    });

    if (!recipe_reaction) {
      // user has no reaction to recipe; create it
      recipe_reaction = await RecipeReactions.create({
        reaction,
        recipe_id,
        owner_id: you.id
      });
    } else if (recipe_reaction.get('reaction') === reaction) {
      // user's reaction is same to request; they intended to undo the reaction
      await recipe_reaction.destroy();
      recipe_reaction = null;
    } else {
      // user's reaction is different to request; they intended to change the reaction
      recipe_reaction.reaction = reaction;
      await recipe_reaction.save({ fields: ['reaction'] });
    }

    return response.status(HttpStatusCode.OK).json({
      message: `Toggled recipe reaction`,
      data: recipe_reaction
    });
  }

  static async get_recipe_reactions_counts(request: Request, response: Response): ExpressResponse {
    const recipe_id: number = parseInt(request.params.recipe_id, 10);

    const like_count = await RecipeReactions.count({ where: { recipe_id, reaction: COMMON_REACTION_TYPES.LIKE } });
    const love_count = await RecipeReactions.count({ where: { recipe_id, reaction: COMMON_REACTION_TYPES.LOVE } });
    const idea_count = await RecipeReactions.count({ where: { recipe_id, reaction: COMMON_REACTION_TYPES.IDEA } });
    const confused_count = await RecipeReactions.count({ where: { recipe_id, reaction: COMMON_REACTION_TYPES.CONFUSED } });

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

  static async get_recipe_reactions_all(request: Request, response: Response): ExpressResponse {
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    const recipe_reactions = await CommonRepo.getAll(
      RecipeReactions,
      'recipe_id',
      recipe_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: recipe_reactions
    });
  }

  static async get_recipe_reactions(request: Request, response: Response): ExpressResponse {
    const recipe_id = parseInt(request.params.recipe_id, 10);
    const recipe_reaction_id: number = parseInt(request.params.recipe_reaction_id, 10);
    const recipe_reactions = await CommonRepo.paginateTable(
      RecipeReactions,
      'recipe_id',
      recipe_id,
      recipe_reaction_id,
      [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    );
    return response.status(HttpStatusCode.OK).json({
      data: recipe_reactions
    });
  }

  static async create_recipe(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const data: PlainObject = JSON.parse(request.body.payload);
    
    let title: string = data.title;
    let description: string = data.description;
    let youtube_link: string = data.youtube_link;
    let tags: string[] = data.tags;
    let ingredients: { name: string; notes: string; }[] = data.ingredients;
    const recipe_image: UploadedFile | undefined = request.files && (<UploadedFile> request.files.recipe_image);

    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Recipe title is required`
      });
    }
    if (!description) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Recipe description is required`
      });
    }

    if (!tags) {
      tags = [];
    }
    const all_tags_valid = tags.length === 0 || tags.every(tag => (typeof (tag) === 'string'));
    if (!all_tags_valid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `All elements in tags list must be a string`
      });
    }
    if (tags.length > 20) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Maximum of tags list is 20`
      });
    }

    if (!ingredients) {
      ingredients = [];
    }
    const all_ingredients_valid = ingredients.length === 0 || ingredients.every((i) => {
      return (
        i.hasOwnProperty('name') && i.hasOwnProperty('notes') &&
        (typeof (i.name) === 'string') && (typeof (i.notes) === 'string')
      );
    });
    if (!all_ingredients_valid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `All ingredients in tags list must be an object with name (string) and notes (string) properties`
      });
    }

    let results: IStoreImage | null = null;

    if (recipe_image) {
      const type = recipe_image.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }

      results = await store_image(recipe_image);
      if (!results.result) {
        console.log(`could not upload image:`, results);
      }
    }

    if (youtube_link) {
      if (!youtube_regex.test(youtube_link)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Youtube link is invalid...'
        });
      }
    }

    const recipe_model = await RecipesRepo.create_recipe({
      title,
      description,
      tags,
      youtube_link,
      ingredients,
      creator_id: you.id,
      visibility: '',
      image_id: results && results.result && results.result.public_id || '',
      image_link: results && results.result && results.result.secure_url || '',
    });

    return response.status(HttpStatusCode.OK).json({
      message: `Recipe created successfully`,
      data: recipe_model
    });
  }

  static async update_recipe(request: Request, response: Response): ExpressResponse {
    const recipe_id: number = parseInt(request.params.recipe_id, 10);
    const you: IUser = response.locals.you;
    const recipe_model: IRecipeModel = response.locals.recipe_model;
    const data: PlainObject = JSON.parse(request.body.payload);
    
    let title: string = data.title;
    let description: string = data.description;
    let youtube_link: string = data.youtube_link;
    let tags: string[] = data.tags;
    let ingredients: { name: string; notes: string; }[] = data.ingredients;
    const recipe_image: UploadedFile | undefined = request.files && (<UploadedFile> request.files.recipe_image);

    if (!title) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Recipe title is required`
      });
    }
    if (!description) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Recipe description is required`
      });
    }

    if (!tags) {
      tags = [];
    }
    const all_tags_valid = tags.length === 0 || tags.every(tag => (typeof (tag) === 'string'));
    if (!all_tags_valid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `All elements in tags list must be a string`
      });
    }
    if (tags.length > 20) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `Maximum of tags list is 20`
      });
    }

    if (!ingredients) {
      ingredients = [];
    }
    const all_ingredients_valid = ingredients.length === 0 || ingredients.every((i) => {
      return (
        i.hasOwnProperty('name') && i.hasOwnProperty('notes') &&
        (typeof (i.name) === 'string') && (typeof (i.notes) === 'string')
      );
    });
    if (!all_ingredients_valid) {
      return response.status(HttpStatusCode.BAD_REQUEST).json({
        message: `All ingredients in tags list must be an object with name (string) and notes (string) properties`
      });
    }

    let results: IStoreImage | null = null;

    if (recipe_image) {
      const type = recipe_image.mimetype.split('/')[1];
      const isInvalidType = !allowedImages.includes(type);
      if (isInvalidType) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Invalid file type: jpg, jpeg or png required...'
        });
      }

      results = await store_image(recipe_image);
      if (!results.result) {
        console.log(`could not upload image:`, results);
      } else {
        // delete old image
        if (recipe_model.get('image_id')) {
          try {
            await delete_cloudinary_image(<string> recipe_model.get('image_id'));
          } catch (e) {
            console.log(e);
          }
        }
      }
    }

    if (youtube_link) {
      if (!youtube_regex.test(youtube_link)) {
        return response.status(HttpStatusCode.BAD_REQUEST).json({
          error: true,
          message: 'Youtube link is invalid...'
        });
      }
    }

    const updates = await RecipesRepo.update_recipe({
      title,
      description,
      tags,
      ingredients,
      youtube_link,
      visibility: '',
      image_id: results && results.result && results.result.public_id || '',
      image_link: results && results.result && results.result.secure_url || '',
    }, recipe_id, you.id);
    const recipe = await RecipesRepo.get_recipe_by_id(recipe_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Recipe updated successfully`,
      updates: updates,
      data: recipe
    });
  }

  static async update_recipe_ingredient(request: Request, response: Response): ExpressResponse {
    const ingredient_id = parseInt(request.params.ingredient_id, 10);
    const updates = await RecipesRepo.update_recipe_ingredient(
      {
        name: request.body.name,
        notes: request.body.notes,
      },
      ingredient_id
    );
    return response.status(HttpStatusCode.OK).json({
      message: `Recipe ingredient updated successfully`,
      updates
    });
  }

  static async delete_recipe(request: Request, response: Response): ExpressResponse {
    const recipe_id = parseInt(request.params.recipe_id, 10);
    const recipe_model: IRecipeModel = response.locals.recipe_model;
    if (recipe_model.get('image_id')) {
      try {
        await delete_cloudinary_image(<string> recipe_model.get('image_id'));
      } catch (e) {
        console.log(e);
      }
    }
    const deletes = await RecipesRepo.delete_recipe(recipe_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Recipe deleted successfully`,
      deletes
    });
  }

  static async delete_recipe_ingredient(request: Request, response: Response): ExpressResponse {
    const ingredient_id = parseInt(request.params.ingredient_id, 10);
    const deletes = await RecipesRepo.delete_recipe_ingredient(ingredient_id);
    return response.status(HttpStatusCode.OK).json({
      message: `Recipe ingredient deleted successfully`,
      deletes
    });
  }
}