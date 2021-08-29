import { Router } from 'express';
import { UserExists, UserAuthorized } from '../../_common/guards/user.guard';
import { RecipeExists, IsRecipeOwner } from '../../../apps/chef-city/guards/recipe.guard';
import { RecipesService } from '../services/recipes.service';
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

RecipesRouter.post('/owner/:you_id', UserAuthorized, RecipesService.create_recipe);

// PUT Routes

RecipesRouter.put('/:recipe_id/owner/:you_id', UserAuthorized, RecipeExists, IsRecipeOwner, RecipesService.update_recipe);
RecipesRouter.put('/:recipe_id/ingredients/:ingredient_id/owner/:you_id', UserAuthorized, RecipeExists, IsRecipeOwner, RecipesService.update_recipe_ingredient);
RecipesRouter.put('/:recipe_id/user-reaction/user/:you_id', UserAuthorized, RecipeExists, RecipesService.toggle_user_reaction);

// DELETE Routes

RecipesRouter.delete('/:recipe_id/ingredients/:ingredient_id/owner/:you_id', UserAuthorized, RecipeExists, IsRecipeOwner, RecipesService.delete_recipe_ingredient);
RecipesRouter.delete('/:recipe_id/owner/:you_id', UserAuthorized, RecipeExists, IsRecipeOwner, RecipesService.delete_recipe);

// Sub-Routes

RecipesRouter.use(`/:recipe_id/comments`, CommentsRouter);