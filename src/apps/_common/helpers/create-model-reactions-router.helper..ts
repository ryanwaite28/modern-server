import { Router } from 'express';
import {
  YouAuthorized,
  UserExists
} from '../guards/user.guard';
import { IGenericModelReactionsRequestHandler } from './create-model-reactions-request-handler.helper';




export interface ICreateCommonGenericModelReactionsRouter {
  reactionRequestHandler: IGenericModelReactionsRequestHandler,
}

export function createCommonGenericModelReactionsRouter(
  params: ICreateCommonGenericModelReactionsRouter
): Router {
  const ReactionsRouter: Router = Router({ mergeParams: true });

  ReactionsRouter.get(`/user-reactions/count`, params.reactionRequestHandler.get_model_reactions_counts);
  ReactionsRouter.get(`/user-reactions/all`, params.reactionRequestHandler.get_model_reactions_all);
  ReactionsRouter.get(`/user-reactions`, params.reactionRequestHandler.get_model_reactions);
  ReactionsRouter.get(`/user-reactions/:reaction_id`, params.reactionRequestHandler.get_model_reactions);
  ReactionsRouter.get(`/user-reaction/:user_id`, UserExists, params.reactionRequestHandler.get_user_reaction);
  
  ReactionsRouter.put(`/user-reaction/user/:you_id`, YouAuthorized, params.reactionRequestHandler.toggle_user_reaction);

  return ReactionsRouter;
}