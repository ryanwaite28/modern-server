import { Router } from 'express';
import { YouAuthorized, UserExists } from '../guards/user.guard';
import { createCommonGenericModelChildrenCrudRouter } from './create-model-children-crud-router.helper';
import { ICommonGenericCommentsRequestHandler } from './create-model-comments-request-handler.helper';
import { ICommonGenericModelChildrenCrudRequestHandler } from './create-model-children-crud-request-handler.helper';
import {
  ICreateModelGuardParams,
  IModelGuards
} from './create-model-guards.helper';




export interface ICreateGenericCommentsRouter {
  makeGuard?: boolean,
  commentsRequestHandler: ICommonGenericCommentsRequestHandler,
  commentGuardsOpts: IModelGuards | ICreateModelGuardParams,
}

export function createGenericCommentsRouter (params: ICreateGenericCommentsRouter): Router {
  const CommentsRouter: Router = Router({ mergeParams: true });
  
  const useClass = class {
    static get_model_by_id = params.commentsRequestHandler.get_comment_by_id;
    static get_models_count = params.commentsRequestHandler.get_comments_count;
    static get_models_all = params.commentsRequestHandler.get_comments_all;
    static get_models = params.commentsRequestHandler.get_comments;
    static create_model = params.commentsRequestHandler.create_comment;
    static update_model = params.commentsRequestHandler.update_comment;
    static delete_model = params.commentsRequestHandler.delete_comment;
  } as ICommonGenericModelChildrenCrudRequestHandler;

  const ChildModelCrudRouter = createCommonGenericModelChildrenCrudRouter({
    child_model_name: 'comment',
    makeGuard: params.makeGuard,
    childModelGuardsOpts: params.commentGuardsOpts,
    childModelCrudRequestHandler: useClass
  });

  CommentsRouter.use(ChildModelCrudRouter);



  return CommentsRouter;
}
