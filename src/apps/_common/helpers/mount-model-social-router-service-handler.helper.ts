import { Router } from "express";
import { user_attrs_slim } from "../common.chamber";
import { MODERN_APP_NAMES } from "../enums/common.enum";
import { PlainObject } from "../interfaces/common.interface";
import { MyModelStatic } from "../models/common.model-types";
import { Users } from "../models/user.model";
import { createCommonGenericModelCommentRepliesRequestHandler } from "./create-model-comment-replies-request-handler.helper";
import { createGenericCommentRepliesRouter } from "./create-model-comment-replies-router.helper";
import { createCommonGenericModelCommentRepliesService } from "./create-model-comment-replies-service.helper";
import { createCommonGenericModelCommentsRequestHandler } from "./create-model-comments-request-handler.helper";
import { createGenericCommentsRouter } from "./create-model-comments-router.helper";
import { createCommonGenericModelCommentsService } from "./create-model-comments-service.helper";
import { createModelRouteGuards, IModelGuards } from "./create-model-guards.helper";
import { createCommonGenericModelReactionsRequestHandler } from "./create-model-reactions-request-handler.helper";
import { createCommonGenericModelReactionsRouter } from "./create-model-reactions-router.helper.";
import { createCommonGenericModelReactionsService } from "./create-model-reactions-service.helper";



export interface IMountGenericModelSocialRouterServiceHandler {
  base_model_name: string,
  base_model_route_guards: IModelGuards,
  mountingRouter: Router,
  micro_app: MODERN_APP_NAMES,
  eventsEnumObj: PlainObject<string>,
  populate_notification_fn: (notification_model: any) => Promise<any>,
  models: {
    base_reactions_model: MyModelStatic,
    base_comments_model: MyModelStatic,
    base_comment_reactions_model: MyModelStatic,
    base_comment_replies_model: MyModelStatic,
    base_comment_reply_reactions_model: MyModelStatic,
  }
}

export function MountGenericModelSocialRouterServiceHandler(params: IMountGenericModelSocialRouterServiceHandler) {

  const {
    base_model_name,
    base_model_route_guards,
    mountingRouter,
    micro_app,
    eventsEnumObj,
    populate_notification_fn,
    models,
  } = params;

  const base_model_name_upper = base_model_name.toUpperCase();

  // check for proper enum values
  const checkEventsEnums = [
    `NEW_${base_model_name_upper}_REACTION`,
    `NEW_${base_model_name_upper}_UNREACTION`,
    `NEW_${base_model_name_upper}_CHANGED_REACTION`,

    `NEW_${base_model_name_upper}_COMMENT`,

    `NEW_${base_model_name_upper}_COMMENT_REACTION`,
    `NEW_${base_model_name_upper}_COMMENT_UNREACTION`,
    `NEW_${base_model_name_upper}_COMMENT_CHANGED_REACTION`,

    `NEW_${base_model_name_upper}_COMMENT_REPLY`,

    `NEW_${base_model_name_upper}_COMMENT_REPLY_REACTION`,
    `NEW_${base_model_name_upper}_COMMENT_REPLY_UNREACTION`,
    `NEW_${base_model_name_upper}_COMMENT_REPLY_CHANGED_REACTION`,
  ];
  for (const eventType of checkEventsEnums) {
    if (!eventsEnumObj[eventType]) {
      console.log({ params });
      throw new TypeError(`Missing ${eventType} from provided events obj...`);
    }
  }

  /* --- Model Reactions --- */

  const ModelReactionsService = createCommonGenericModelReactionsService({
    base_model_name,
    micro_app,
    reactionEvents: {
      REACTED: eventsEnumObj[`NEW_${base_model_name_upper}_REACTION`],
      UNREACTED: eventsEnumObj[`NEW_${base_model_name_upper}_UNREACTION`],
      CHANGE_REACTED: eventsEnumObj[`NEW_${base_model_name_upper}_CHANGED_REACTION`],
    },
    target_type: `${base_model_name_upper}`,
    populate_notification_fn,
    reaction_model: models.base_reactions_model,
  });
  const ModelReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
    base_model_name,
    reactionsService: ModelReactionsService,
  });
  const ModelReactionsRouter = createCommonGenericModelReactionsRouter({
    reactionRequestHandler: ModelReactionsRequestHandler,
  });
  mountingRouter.use(`/:${base_model_name}_id`, base_model_route_guards.existsGuard, ModelReactionsRouter);



  /* --- Model Comments --- */

  const ModelCommentsService = createCommonGenericModelCommentsService({
    base_model_name,
    micro_app,
    create_model_event: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT`],
    target_type: `${base_model_name_upper}_COMMENT`,
    populate_notification_fn,
    comment_model: models.base_comments_model,
  });
  const ModelCommentsGuard = createModelRouteGuards({
    get_model_fn: (id: number) => {
      return models.base_comments_model.findOne({
        where: { id },
        include: [{
          model: Users,
          as: `owner`,
          attributes: user_attrs_slim,
        }]
      })
    },
    model_name: `comment`,
    model_owner_field: `owner_id`,
    request_param_id_name: `comment_id`,
  });
  const ModelCommentsRequestHandler = createCommonGenericModelCommentsRequestHandler({
    base_model_name,
    commentsService: ModelCommentsService
  });
  const ModelCommentsRouter = createGenericCommentsRouter({
    commentsRequestHandler: ModelCommentsRequestHandler,
    commentGuardsOpts: ModelCommentsGuard,
  });
  mountingRouter.use(`/:${base_model_name}_id/comments`, base_model_route_guards.existsGuard, ModelCommentsRouter);



  /* --- Model Comment Reactions --- */

  const ModelCommentReactionsService = createCommonGenericModelReactionsService({
    base_model_name,
    micro_app,
    reactionEvents: {
      REACTED: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_REACTION`],
      UNREACTED: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_UNREACTION`],
      CHANGE_REACTED: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_CHANGED_REACTION`],
    },
    target_type: `${base_model_name_upper}_COMMENT`,
    populate_notification_fn,
    reaction_model: models.base_comment_reactions_model,
  });
  const ModelCommentReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
    base_model_name,
    reactionsService: ModelCommentReactionsService
  });
  const ModelCommentReactionsRouter = createCommonGenericModelReactionsRouter({
    reactionRequestHandler: ModelCommentReactionsRequestHandler,
  });
  mountingRouter.use(`/:${base_model_name}_id/comments/:comment_id`, base_model_route_guards.existsGuard, ModelCommentsGuard.existsGuard, ModelCommentReactionsRouter);




  /* --- Model Comment Replies --- */

  const ModelCommentRepliesService = createCommonGenericModelCommentRepliesService({
    micro_app,
    create_model_event: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_REPLY`],
    target_type: `${base_model_name_upper}_COMMENT_REPLY`,
    populate_notification_fn,
    comment_reply_model: models.base_comment_replies_model,
  });
  const ModelCommentReplyGuard = createModelRouteGuards({
    get_model_fn: (id: number) => {
      return models.base_comment_replies_model.findOne({
        where: { id },
        include: [{
          model: Users,
          as: `owner`,
          attributes: user_attrs_slim
        }]
      })
    },
    model_name: `reply`,
    model_owner_field: `owner_id`,
    request_param_id_name: `reply_id`,
  });
  const ModelCommentRepliesRequestHandler = createCommonGenericModelCommentRepliesRequestHandler({
    commentRepliesService: ModelCommentRepliesService,
  });
  const ModelCommentRepliesRouter = createGenericCommentRepliesRouter({
    repliesRequestHandler: ModelCommentRepliesRequestHandler,
    replyGuardsOpts: ModelCommentReplyGuard,
  });
  mountingRouter.use(`/:${base_model_name}_id/comments/:comment_id/replies`, base_model_route_guards.existsGuard, ModelCommentsGuard.existsGuard, ModelCommentRepliesRouter);



  /* --- Model Comment Reply Reactions --- */

  const ModelCommentReplyReactionsService = createCommonGenericModelReactionsService({
    base_model_name,
    micro_app,
    reactionEvents: {
      REACTED: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_REPLY_REACTION`],
      UNREACTED: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_REPLY_UNREACTION`],
      CHANGE_REACTED: eventsEnumObj[`NEW_${base_model_name_upper}_COMMENT_REPLY_CHANGED_REACTION`],
    },
    target_type: `${base_model_name_upper}_COMMENT_REPLY`,
    populate_notification_fn,
    reaction_model: models.base_comment_reply_reactions_model,
  });
  const ModelCommentReplyReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
    base_model_name,
    reactionsService: ModelCommentReplyReactionsService,
  });
  const ModelCommentReplyReactionsRouter = createCommonGenericModelReactionsRouter({
    reactionRequestHandler: ModelCommentReplyReactionsRequestHandler,
  });
  mountingRouter.use(`/:${base_model_name}_id/comments/:comment_id/replies/:reply_id`, base_model_route_guards.existsGuard, ModelCommentsGuard.existsGuard, ModelCommentReplyGuard.existsGuard, ModelCommentReplyReactionsRouter);

  return;
}