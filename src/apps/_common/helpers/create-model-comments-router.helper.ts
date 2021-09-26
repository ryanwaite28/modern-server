import { Router } from 'express';
import {
  UserAuthorized,
  UserExists
} from '../guards/user.guard';
import {
  ICreateModelGuardParams,
  createModelRouteGuards
} from './create-model-guards.helper';
import { createGenericCommentRepliesRouter } from './create-model-comment-replies-router.helper';
import { createCommonGenericModelReactionsRouter } from './create-model-reactions-router.helper.';
import { IGenericCommentRepliesService } from './create-model-comment-replies-service.helper';
import { IGenericCommentsService } from './create-model-comments-service.helper';




export interface ICreateGenericCommentsRouter {
  commentsService: IGenericCommentsService,
  commentGuardsOpts: ICreateModelGuardParams,

  repliesService?: IGenericCommentRepliesService,
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
  const ReactionsRouter = createCommonGenericModelReactionsRouter({
    base_model_name: 'comment',
    makeGuard: false,
    modelGuardsOpts: routeGuards,
    reactionService: params.repliesService!.reactionsService,
  });
  CommentsRouter.use(ReactionsRouter);

  return CommentsRouter;
}
