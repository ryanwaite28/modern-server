import { Router } from 'express';
import {
  UserAuthorized,
  UserExists
} from '../guards/user.guard';
import {
  ICreateModelGuardParams,
  createModelRouteGuards
} from './create-model-guards.helper';
import { createGenericRepliesRouter } from './create-model-comment-replies-router.helper';




export interface ICreateGenericCommentsRouter {
  generateRepliesRouter: boolean,

  commentsService: any,
  commentGuardsOpts: ICreateModelGuardParams,

  repliesService?: any,
  replyGuardsOpts?: ICreateModelGuardParams,
}

export function createGenericCommentsRouter (params: ICreateGenericCommentsRouter) {
  const CommentsRouter: Router = Router({ mergeParams: true });
  const routeGuards = createModelRouteGuards(params.commentGuardsOpts);

  // GET Routes
  CommentsRouter.get('/count', params.commentsService.get_comments_count);
  CommentsRouter.get('/all', params.commentsService.get_comments_all);
  CommentsRouter.get('/', params.commentsService.get_comments);
  CommentsRouter.get('/:comment_id', routeGuards.existsGuard, params.commentsService.get_comments);
  
  
  // POST Routes
  CommentsRouter.post('/owner/:you_id', UserAuthorized, params.commentsService.create_comment);
  

  // PUT Routes
  CommentsRouter.put('/:comment_id/owner/:you_id', UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.commentsService.update_comment);


  // DELETE Routes
  CommentsRouter.delete('/:comment_id/owner/:you_id', UserAuthorized, routeGuards.existsGuard, routeGuards.isOwnerGuard, params.commentsService.delete_comment);


  // Reactions
  CommentsRouter.get('/:comment_id/user-reactions/count', routeGuards.existsGuard, params.commentsService.get_comment_reactions_counts);
  CommentsRouter.get('/:comment_id/user-reactions/all', routeGuards.existsGuard, params.commentsService.get_comment_reactions_all);
  CommentsRouter.get('/:comment_id/user-reactions', routeGuards.existsGuard, params.commentsService.get_comment_reactions);
  CommentsRouter.get('/:comment_id/user-reactions/:reaction_id', routeGuards.existsGuard, params.commentsService.get_comment_reactions);
  CommentsRouter.get('/:comment_id/user-reaction/:user_id', UserExists, routeGuards.existsGuard, params.commentsService.get_user_reaction);
  CommentsRouter.put('/:comment_id/user-reaction/user/:you_id', UserAuthorized, routeGuards.existsGuard, params.commentsService.toggle_user_reaction);


  // Sub-Routes

  if (!params.generateRepliesRouter) {
    return CommentsRouter;
  }

  if (!params.repliesService || !params.replyGuardsOpts) {
    console.log(params);
    throw new TypeError(`createGenericCommentsRouter error: generateRepliesRouter is true but missing required reply props...`);
  }

  const RepliesRouter = createGenericRepliesRouter({
    repliesService: params.repliesService!,
    replyGuardsOpts: params.replyGuardsOpts!,
  });

  CommentsRouter.use(`/:comment_id/replies`, RepliesRouter);

  return CommentsRouter;
}
