import { Router } from 'express';
import { YouAuthorized, UserExists } from '../guards/user.guard';
import { createCommonGenericModelChildrenCrudRouter } from './create-model-children-crud-router.helper';
import { ICommonGenericModelChildrenCrudService } from './create-model-children-crud-service.helper';
import { IGenericCommentRepliesService } from './create-model-comment-replies-service.helper';
import {
  ICreateModelGuardParams,
  createModelRouteGuards,
  IModelGuards,
} from './create-model-guards.helper';




export interface ICreateCommonGenericCommentRepliesRouter {
  makeGuard?: boolean,
  replyGuardsOpts: IModelGuards | ICreateModelGuardParams,
  repliesService: IGenericCommentRepliesService,
}

export function createGenericCommentRepliesRouter (params: ICreateCommonGenericCommentRepliesRouter) {
  const RepliesRouter: Router = Router({ mergeParams: true });

  const useClass = class {
    static get_model_by_id = params.repliesService.get_comment_reply_by_id;
    static get_models_count = params.repliesService.get_comment_replies_count;
    static get_models_all = params.repliesService.get_comment_replies_all;
    static get_models = params.repliesService.get_comment_replies;
    static create_model = params.repliesService.create_comment_reply;
    static update_model = params.repliesService.update_comment_reply;
    static delete_model = params.repliesService.delete_comment_reply;
  } as ICommonGenericModelChildrenCrudService;

  const ChildModelCrudRouter = createCommonGenericModelChildrenCrudRouter({
    child_model_name: 'reply',
    makeGuard: params.makeGuard,
    childModelGuardsOpts: params.replyGuardsOpts,
    childModelCrudService: useClass
  });

  RepliesRouter.use(ChildModelCrudRouter);
  


  return RepliesRouter;
}
