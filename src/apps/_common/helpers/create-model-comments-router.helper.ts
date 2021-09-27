import { Router } from 'express';
import {
  UserAuthorized,
  UserExists
} from '../guards/user.guard';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
  IModelGuards
} from './create-model-guards.helper';
import { IGenericCommentsService } from './create-model-comments-service.helper';




export interface ICreateGenericCommentsRouter {
  makeGuard?: boolean,
  commentsService: IGenericCommentsService,
  commentGuardsOpts: IModelGuards | ICreateModelGuardParams,
}

export function createGenericCommentsRouter (params: ICreateGenericCommentsRouter) {
  const CommentsRouter: Router = Router({ mergeParams: true });
  const routeGuards: IModelGuards = params.makeGuard
    ? createModelRouteGuards(params.commentGuardsOpts as ICreateModelGuardParams)
    : params.commentGuardsOpts as IModelGuards;

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



  return CommentsRouter;
}
