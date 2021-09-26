import { Router } from 'express';
import { UserAuthorized, UserExists } from '../guards/user.guard';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
} from './create-model-guards.helper';
import { createCommonGenericModelReactionsRouter } from './create-model-reactions-router.helper.';




export interface ICreateGenericCommentRepliesRouter {
  replyGuardsOpts: ICreateModelGuardParams,
  repliesService: any,
}

export function createGenericCommentRepliesRouter (params: ICreateGenericCommentRepliesRouter) {
  const RepliesRouter: Router = Router({ mergeParams: true });

  const routeGuards = createModelRouteGuards(params.replyGuardsOpts);

  // GET Routes
  RepliesRouter.get('/count', params.repliesService.get_comment_replies_count);
  RepliesRouter.get('/all', params.repliesService.get_comment_replies_all);
  RepliesRouter.get('/', params.repliesService.get_comment_replies);
  RepliesRouter.get('/:reply_id', routeGuards.existsGuard, params.repliesService.get_comment_replies);
  

  // POST Routes
  RepliesRouter.post('/owner/:you_id', UserAuthorized, params.repliesService.create_reply);
  

  // PUT Routes
  RepliesRouter.put('/:reply_id/owner/:you_id', UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.repliesService.update_reply);
  
  
  // DELETE Routes
  RepliesRouter.delete('/:reply_id/owner/:you_id', UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.repliesService.delete_reply);
  

  // Reactions
  const ReactionsRouter = createCommonGenericModelReactionsRouter({
    base_model_name: 'reply',
    makeGuard: false,
    modelGuardsOpts: routeGuards,
    reactionService: params.repliesService.reactionService,
  });
  RepliesRouter.use(ReactionsRouter);

  return RepliesRouter;
}