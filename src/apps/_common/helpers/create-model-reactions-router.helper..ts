import { Router } from 'express';
import {
  UserAuthorized,
  UserExists
} from '../guards/user.guard';
import { createModelRouteGuards, ICreateModelGuardParams, IModelGuards } from './create-model-guards.helper';




export interface ICreateCommonGenericModelReactionsRouter {
  base_model_name: string,
  modelGuardsOpts: IModelGuards | ICreateModelGuardParams,
  makeGuard?: boolean,
  reactionService: any,
}

export function createCommonGenericModelReactionsRouter(
  params: ICreateCommonGenericModelReactionsRouter
) {
  const ReactionsRouter: Router = Router({ mergeParams: true });
  const routeGuards: IModelGuards = params.makeGuard
    ? createModelRouteGuards(params.modelGuardsOpts as ICreateModelGuardParams)
    : params.modelGuardsOpts as IModelGuards;

  const model_id_path = `${params.base_model_name}_id`;

  ReactionsRouter.get(`/:${model_id_path}/user-reactions/count`, routeGuards.existsGuard, params.reactionService.get_model_reactions_counts);
  ReactionsRouter.get(`/:${model_id_path}/user-reactions/all`, routeGuards.existsGuard, params.reactionService.get_model_reactions_all);
  ReactionsRouter.get(`/:${model_id_path}/user-reactions`, routeGuards.existsGuard, params.reactionService.get_model_reactions);
  ReactionsRouter.get(`/:${model_id_path}/user-reactions/:reaction_id`, routeGuards.existsGuard, params.reactionService.get_model_reactions);
  ReactionsRouter.get(`/:${model_id_path}/user-reaction/:user_id`, UserExists, routeGuards.existsGuard, params.reactionService.get_user_reaction);
  
  ReactionsRouter.put(`/:${model_id_path}/user-reaction/user/:you_id`, UserAuthorized, routeGuards.existsGuard, params.reactionService.toggle_user_reaction);

  return ReactionsRouter;
}