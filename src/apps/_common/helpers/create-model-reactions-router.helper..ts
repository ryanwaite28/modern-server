import { Router } from 'express';
import {
  UserAuthorized,
  UserExists
} from '../guards/user.guard';




export interface ICreateCommonGenericModelReactionsRouter {
  reactionService: any,
}

export function createCommonGenericModelReactionsRouter(
  params: ICreateCommonGenericModelReactionsRouter
) {
  const ReactionsRouter: Router = Router({ mergeParams: true });

  ReactionsRouter.get(`/user-reactions/count`, params.reactionService.get_model_reactions_counts);
  ReactionsRouter.get(`/user-reactions/all`, params.reactionService.get_model_reactions_all);
  ReactionsRouter.get(`/user-reactions`, params.reactionService.get_model_reactions);
  ReactionsRouter.get(`/user-reactions/:reaction_id`, params.reactionService.get_model_reactions);
  ReactionsRouter.get(`/user-reaction/:user_id`, UserExists, params.reactionService.get_user_reaction);
  
  ReactionsRouter.put(`/user-reaction/user/:you_id`, UserAuthorized, params.reactionService.toggle_user_reaction);

  return ReactionsRouter;
}