import { Router } from 'express';
import { YouAuthorized } from '../../_common/guards/user.guard';
import { get_recipe_by_id } from '../repos/recipes.repo';
import { createModelRouteGuards } from '../../_common/helpers/create-model-guards.helper';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { populate_chefcity_notification_obj } from '../chefcity.chamber';
import { CHEFCITY_EVENT_TYPES } from '../enums/chefcity.enum';
import { RecipeReactions, RecipeComments, RecipeCommentReactions, RecipeCommentReplies, RecipeCommentReplyReactions } from '../models/recipe.model';
import { MountGenericModelSocialRouterServiceHandler } from 'src/apps/_common/helpers/mount-model-social-router-service-handler.helper';
import { RecipesRequestHandler } from '../handlers/recipes.handler';



export const RecipesRouter: Router = Router({ mergeParams: true });

const RecipeRouteGuards = createModelRouteGuards({
  get_model_fn: get_recipe_by_id,
  model_name: 'recipe',
  model_owner_field: 'owner_id',
  request_param_id_name: 'recipe_id',
});



// GET Routes

RecipesRouter.get('/:recipe_id', RecipeRouteGuards.existsGuard, RecipesRequestHandler.get_recipe_by_id);


// POST Routes

RecipesRouter.post('/owner/:you_id', YouAuthorized, RecipesRequestHandler.create_recipe);


// PUT Routes

RecipesRouter.put('/:recipe_id/owner/:you_id', YouAuthorized, RecipeRouteGuards.existsGuard, RecipeRouteGuards.isOwnerGuard, RecipesRequestHandler.update_recipe);
RecipesRouter.put('/:recipe_id/ingredients/:ingredient_id/owner/:you_id', YouAuthorized, RecipeRouteGuards.existsGuard, RecipeRouteGuards.isOwnerGuard, RecipesRequestHandler.update_recipe_ingredient);


// DELETE Routes

RecipesRouter.delete('/:recipe_id/ingredients/:ingredient_id/owner/:you_id', YouAuthorized, RecipeRouteGuards.existsGuard, RecipeRouteGuards.isOwnerGuard, RecipesRequestHandler.delete_recipe_ingredient);
RecipesRouter.delete('/:recipe_id/owner/:you_id', YouAuthorized, RecipeRouteGuards.existsGuard, RecipeRouteGuards.isOwnerGuard, RecipesRequestHandler.delete_recipe);




/* --- Recipe Social Constructs --- */

MountGenericModelSocialRouterServiceHandler({
  base_model_name: `recipe`,
  base_model_route_guards: RecipeRouteGuards,
  mountingRouter: RecipesRouter,
  micro_app: MODERN_APP_NAMES.CHEFCITY,
  eventsEnumObj: CHEFCITY_EVENT_TYPES,
  populate_notification_fn: populate_chefcity_notification_obj,
  models: {
    base_reactions_model: RecipeReactions,
    base_comments_model: RecipeComments,
    base_comment_reactions_model: RecipeCommentReactions,
    base_comment_replies_model: RecipeCommentReplies,
    base_comment_reply_reactions_model: RecipeCommentReplyReactions,
  }
});
