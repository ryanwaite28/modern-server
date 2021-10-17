import { Router } from 'express';
import { createCommonGenericModelChildrenCrudRouter } from './create-model-children-crud-router.helper';
import { ICommonGenericModelChildrenCrudRequestHandler } from './create-model-children-crud-request-handler.helper';
import { IGenericCommentRepliesRequestHandler } from './create-model-comment-replies-request-handler.helper';
import {
  ICreateModelGuardParams,
  IModelGuards,
} from './create-model-guards.helper';




export interface ICreateCommonGenericCommentRepliesRouter {
  makeGuard?: boolean,
  replyGuardsOpts: IModelGuards | ICreateModelGuardParams,
  repliesRequestHandler: IGenericCommentRepliesRequestHandler,
}

export function createGenericCommentRepliesRouter (params: ICreateCommonGenericCommentRepliesRouter) {
  const RepliesRouter: Router = Router({ mergeParams: true });

  const useClass = class {
    static get_model_by_id = params.repliesRequestHandler.get_comment_reply_by_id;
    static get_models_count = params.repliesRequestHandler.get_comment_replies_count;
    static get_models_all = params.repliesRequestHandler.get_comment_replies_all;
    static get_models = params.repliesRequestHandler.get_comment_replies;
    static create_model = params.repliesRequestHandler.create_comment_reply;
    static update_model = params.repliesRequestHandler.update_comment_reply;
    static delete_model = params.repliesRequestHandler.delete_comment_reply;
  } as ICommonGenericModelChildrenCrudRequestHandler;

  const ChildModelCrudRouter = createCommonGenericModelChildrenCrudRouter({
    child_model_name: 'reply',
    makeGuard: params.makeGuard,
    childModelGuardsOpts: params.replyGuardsOpts,
    childModelCrudRequestHandler: useClass
  });

  RepliesRouter.use(ChildModelCrudRouter);
  


  return RepliesRouter;
}
