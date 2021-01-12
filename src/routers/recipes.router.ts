import { Router } from 'express';
import { RecipesService } from '../services/recipes.service';
import {
  RecipeExists,
  IsRecipeOwner
} from '../guards/recipe.guard';
import {
  UserAuthorizedSlim,
  UserExists
} from '../guards/user.guard';
import { CommentsRouter } from './recipe-comments.router';



export const RecipesRouter: Router = Router({ mergeParams: true });

// GET Routes

RecipesRouter.get('/:recipe_id', RecipeExists, RecipesService.get_recipe_by_id);
RecipesRouter.get('/:recipe_id/user-reactions/count', RecipeExists, RecipesService.get_recipe_reactions_counts);
RecipesRouter.get('/:recipe_id/user-reactions/all', RecipeExists, RecipesService.get_recipe_reactions_all);
RecipesRouter.get('/:recipe_id/user-reactions', RecipeExists, RecipesService.get_recipe_reactions);
RecipesRouter.get('/:recipe_id/user-reactions/:recipe_reaction_id', RecipeExists, RecipesService.get_recipe_reactions);
RecipesRouter.get('/:recipe_id/user-reaction/:user_id', UserExists, RecipeExists, RecipesService.get_user_reaction);

// POST Routes

RecipesRouter.post('/', UserAuthorizedSlim, RecipesService.create_recipe);

// PUT Routes

RecipesRouter.put('/:recipe_id', UserAuthorizedSlim, RecipeExists, IsRecipeOwner, RecipesService.update_recipe);
RecipesRouter.put('/:recipe_id/ingredients/:ingredient_id', UserAuthorizedSlim, RecipeExists, IsRecipeOwner, RecipesService.update_recipe_ingredient);
RecipesRouter.put('/:recipe_id/user-reaction', UserAuthorizedSlim, RecipeExists, RecipesService.toggle_user_reaction);

// DELETE Routes

RecipesRouter.delete('/:recipe_id/ingredients/:ingredient_id', UserAuthorizedSlim, RecipeExists, IsRecipeOwner, RecipesService.delete_recipe_ingredient);
RecipesRouter.delete('/:recipe_id', UserAuthorizedSlim, RecipeExists, IsRecipeOwner, RecipesService.delete_recipe);

// Sub-Routes

RecipesRouter.use(`/:recipe_id/comments`, CommentsRouter);