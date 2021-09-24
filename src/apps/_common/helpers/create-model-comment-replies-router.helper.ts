import { Router } from 'express';
import { UserAuthorized, UserExists } from '../guards/user.guard';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
} from './create-model-guards.helper';




export function createGenericRepliesRouter (params: {
  replyGuardsOpts: ICreateModelGuardParams,
  repliesService: any,
}) {
  const RepliesRouter: Router = Router({ mergeParams: true });

  const routeGuards = createModelRouteGuards(params.replyGuardsOpts);

  // GET Routes

  RepliesRouter.get('/count', params.repliesService.get_comment_replies_count);
  RepliesRouter.get('/all', params.repliesService.get_comment_replies_all);

  RepliesRouter.get('/', params.repliesService.get_comment_replies);
  RepliesRouter.get('/:reply_id', routeGuards.existsGuard, params.repliesService.get_comment_replies);
  RepliesRouter.get('/:reply_id/user-reactions/count', routeGuards.existsGuard, params.repliesService.get_reply_reactions_counts);
  RepliesRouter.get('/:reply_id/user-reactions/all', routeGuards.existsGuard, params.repliesService.get_reply_reactions_all);
  RepliesRouter.get('/:reply_id/user-reactions', routeGuards.existsGuard, params.repliesService.get_reply_reactions);
  RepliesRouter.get('/:reply_id/user-reactions/:reply_reaction_id', routeGuards.existsGuard, params.repliesService.get_reply_reactions);
  RepliesRouter.get('/:reply_id/user-reaction/:user_id', UserExists, routeGuards.existsGuard, params.repliesService.get_user_reaction);

  // POST Routes

  RepliesRouter.post('/owner/:you_id', UserAuthorized, params.repliesService.create_reply);

  // PUT Routes

  RepliesRouter.put('/:reply_id/owner/:you_id', UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.repliesService.update_reply);
  RepliesRouter.put('/:reply_id/user-reaction/user/:you_id', UserAuthorized, routeGuards.existsGuard, params.repliesService.toggle_user_reaction);

  // DELETE Routes

  RepliesRouter.delete('/:reply_id/owner/:you_id', UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.repliesService.delete_reply);

  return RepliesRouter;
}