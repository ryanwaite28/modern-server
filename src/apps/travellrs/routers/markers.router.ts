import { Router } from 'express';
import { YouAuthorized } from '../../_common/guards/user.guard';
import { MarkersRequestHandler } from '../handlers/markers.handler';
import { createCommonGenericModelReactionsService } from '../../_common/helpers/create-model-reactions-service.helper';
import { createCommonGenericModelReactionsRequestHandler } from '../../_common/helpers/create-model-reactions-request-handler.helper';
import { createCommonGenericModelReactionsRouter } from '../../_common/helpers/create-model-reactions-router.helper.';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { createCommonGenericModelCommentsService } from '../../_common/helpers/create-model-comments-service.helper';
import { populate_travellrs_notification_obj } from '../../travellrs/travellrs.chamber';
import { user_attrs_slim } from '../../_common/common.chamber';
import { createCommonGenericModelCommentRepliesRequestHandler } from '../../_common/helpers/create-model-comment-replies-request-handler.helper';
import { createGenericCommentRepliesRouter } from '../../_common/helpers/create-model-comment-replies-router.helper';
import { createCommonGenericModelCommentRepliesService } from '../../_common/helpers/create-model-comment-replies-service.helper';
import { createCommonGenericModelCommentsRequestHandler } from '../../_common/helpers/create-model-comments-request-handler.helper';
import { createGenericCommentsRouter } from '../../_common/helpers/create-model-comments-router.helper';
import { createModelRouteGuards } from '../../_common/helpers/create-model-guards.helper';
import { Users } from '../../_common/models/user.model';
import { get_marker_by_id } from '../repos/markers.repo';
import { TRAVELLRS_EVENT_TYPES, TRAVELLRS_NOTIFICATION_TARGET_TYPES } from '../enums/travellrs.enum';
import { MarkerCommentReactions, MarkerCommentReplies, MarkerCommentReplyReactions, MarkerComments, MarkerReactions } from '../models/marker.model';



export const MarkersRouter: Router = Router();

const MarkerRouteGuards = createModelRouteGuards({
  get_model_fn: get_marker_by_id,
  model_name: 'marker',
  model_owner_field: 'owner_id',
  request_param_id_name: 'marker_id',
});

// GET Routes

MarkersRouter.get('/random', MarkerRouteGuards.existsGuard, MarkersRequestHandler.get_random_markers);
MarkersRouter.get('/:marker_id', MarkerRouteGuards.existsGuard, MarkersRequestHandler.get_marker_by_id);



// MARKER Routes

MarkersRouter.post('/owner/:you_id', YouAuthorized, MarkersRequestHandler.create_marker);



// PUT Routes

MarkersRouter.put('/:marker_id/owner/:you_id', YouAuthorized, MarkerRouteGuards.existsGuard, MarkerRouteGuards.isOwnerGuard, MarkersRequestHandler.update_marker);



// DELETE Routes

MarkersRouter.delete('/:marker_id/owner/:you_id', YouAuthorized, MarkerRouteGuards.existsGuard, MarkerRouteGuards.isOwnerGuard, MarkersRequestHandler.delete_marker);




/* --- Marker Reactions --- */

const MarkerReactionsService = createCommonGenericModelReactionsService({
  base_model_name: `marker`,
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  reactionEvents: {
    REACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_REACTION,
    UNREACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_UNREACTION,
    CHANGE_REACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_CHANGED_REACTION,
  },
  target_type: TRAVELLRS_NOTIFICATION_TARGET_TYPES.MARKER,
  populate_notification_fn: populate_travellrs_notification_obj,
  reaction_model: MarkerReactions,
});
const MarkerReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: `marker`,
  reactionsService: MarkerReactionsService,
});
const MarkerReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: MarkerReactionsRequestHandler,
});
MarkersRouter.use(`/:marker_id`, MarkerRouteGuards.existsGuard, MarkerReactionsRouter);



/* --- Marker Comments --- */

const MarkerCommentsService = createCommonGenericModelCommentsService({
  base_model_name: `marker`,
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  create_model_event: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT,
  target_type: TRAVELLRS_NOTIFICATION_TARGET_TYPES.MARKER,
  populate_notification_fn: populate_travellrs_notification_obj,
  comment_model: MarkerComments,
});
const MarkerCommentsGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return MarkerComments.findOne({
      where: { id },
      include: [{
        model: Users,
        as: `owner`,
        attributes: user_attrs_slim
      }]
    })
  },
  model_name: `comment`,
  model_owner_field: `owner_id`,
  request_param_id_name: `comment_id`,
});
const MarkerCommentsRequestHandler = createCommonGenericModelCommentsRequestHandler({
  base_model_name: `marker`,
  commentsService: MarkerCommentsService
});
const MarkerCommentsRouter = createGenericCommentsRouter({
  commentsRequestHandler: MarkerCommentsRequestHandler,
  commentGuardsOpts: MarkerCommentsGuard,
});
MarkersRouter.use(`/:marker_id/comments`, MarkerRouteGuards.existsGuard, MarkerCommentsRouter);



/* --- Marker Comment Reactions --- */

const MarkerCommentReactionsService = createCommonGenericModelReactionsService({
  base_model_name: `marker`,
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  reactionEvents: {
    REACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_REACTION,
    UNREACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_UNREACTION,
    CHANGE_REACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_CHANGED_REACTION,
  },
  target_type: TRAVELLRS_NOTIFICATION_TARGET_TYPES.MARKER_COMMENT,
  populate_notification_fn: populate_travellrs_notification_obj,
  reaction_model: MarkerCommentReactions
});
const MarkerCommentReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: `marker`,
  reactionsService: MarkerCommentReactionsService
});
const MarkerCommentReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: MarkerCommentReactionsRequestHandler,
});
MarkersRouter.use(`/:marker_id/comments/:comment_id`, MarkerRouteGuards.existsGuard, MarkerCommentsGuard.existsGuard, MarkerCommentReactionsRouter);




/* --- Marker Comment Replies --- */

const MarkerCommentRepliesService = createCommonGenericModelCommentRepliesService({
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  create_model_event: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_REPLY,
  target_type: TRAVELLRS_NOTIFICATION_TARGET_TYPES.MARKER_COMMENT_REPLY,
  populate_notification_fn: populate_travellrs_notification_obj,
  comment_reply_model: MarkerCommentReplies,
});
const MarkerCommentReplyGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return MarkerCommentReplies.findOne({
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
const MarkerCommentRepliesRequestHandler = createCommonGenericModelCommentRepliesRequestHandler({
  commentRepliesService: MarkerCommentRepliesService,
});
const MarkerCommentRepliesRouter = createGenericCommentRepliesRouter({
  repliesRequestHandler: MarkerCommentRepliesRequestHandler,
  replyGuardsOpts: MarkerCommentReplyGuard,
});
MarkersRouter.use(`/:marker_id/comments/:comment_id/replies`, MarkerRouteGuards.existsGuard, MarkerCommentsGuard.existsGuard, MarkerCommentRepliesRouter);



/* --- Marker Comment Reply Reactions --- */

const MarkerCommentReplyReactionsService = createCommonGenericModelReactionsService({
  base_model_name: `marker`,
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  reactionEvents: {
    REACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_REPLY_REACTION,
    UNREACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_REPLY_UNREACTION,
    CHANGE_REACTED: TRAVELLRS_EVENT_TYPES.NEW_MARKER_COMMENT_REPLY_CHANGED_REACTION,
  },
  target_type: TRAVELLRS_NOTIFICATION_TARGET_TYPES.MARKER_COMMENT_REPLY,
  populate_notification_fn: populate_travellrs_notification_obj,
  reaction_model: MarkerCommentReplyReactions
});
const MarkerCommentReplyReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: `marker`,
  reactionsService: MarkerCommentReplyReactionsService,
});
const MarkerCommentReplyReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: MarkerCommentReplyReactionsRequestHandler,
});
MarkersRouter.use(`/:marker_id/comments/:comment_id/replies/:reply_id`, MarkerRouteGuards.existsGuard, MarkerCommentsGuard.existsGuard, MarkerCommentReplyGuard.existsGuard, MarkerCommentReplyReactionsRouter);
