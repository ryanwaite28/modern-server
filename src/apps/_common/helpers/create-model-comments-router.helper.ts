import { Router } from 'express';
import { YouAuthorized, UserExists } from '../guards/user.guard';
import { createCommonGenericModelChildrenCrudRouter } from './create-model-children-crud-router.helper';
import { ICommonGenericCommentsService } from './create-model-comments-service.helper';
import { ICommonGenericModelChildrenCrudService } from './create-model-children-crud-service.helper';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
  IModelGuards
} from './create-model-guards.helper';




export interface ICreateGenericCommentsRouter {
  makeGuard?: boolean,
  commentsService: ICommonGenericCommentsService,
  commentGuardsOpts: IModelGuards | ICreateModelGuardParams,
}

export function createGenericCommentsRouter (params: ICreateGenericCommentsRouter) {
  const CommentsRouter: Router = Router({ mergeParams: true });
  
  const useClass = class {
    static get_model_by_id = params.commentsService.get_comment_by_id;
    static get_models_count = params.commentsService.get_comments_count;
    static get_models_all = params.commentsService.get_comments_all;
    static get_models = params.commentsService.get_comments;
    static create_model = params.commentsService.create_comment;
    static update_model = params.commentsService.update_comment;
    static delete_model = params.commentsService.delete_comment;
  } as ICommonGenericModelChildrenCrudService;

  const ChildModelCrudRouter = createCommonGenericModelChildrenCrudRouter({
    child_model_name: 'comment',
    makeGuard: params.makeGuard,
    childModelGuardsOpts: params.commentGuardsOpts,
    childModelCrudService: useClass
  });

  CommentsRouter.use(ChildModelCrudRouter);



  return CommentsRouter;
}
