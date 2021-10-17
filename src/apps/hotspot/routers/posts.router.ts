import { Router } from 'express';
import { PostsService } from '../services/posts.service';
import {
  YouAuthorized,
  YouAuthorizedSlim,
  UserExists
} from '../../_common/guards/user.guard';
import { user_attrs_slim } from '../../../apps/_common/common.chamber';
import { createCommonGenericModelCommentRepliesService } from '../../../apps/_common/helpers/create-model-comment-replies-service.helper';
import { createGenericCommentsRouter } from '../../../apps/_common/helpers/create-model-comments-router.helper';
import { createCommonGenericModelCommentsService } from '../../../apps/_common/helpers/create-model-comments-service.helper';
import { Users } from '../../../apps/_common/models/user.model';
import { HotspotPostComments, HotspotPostCommentReactions, HotspotPostCommentReplies, HotspotPostCommentReplyReactions, HotspotPostReactions } from '../models/post.model';
import { createGenericCommentRepliesRouter } from '../../../apps/_common/helpers/create-model-comment-replies-router.helper';
import { createCommonGenericModelReactionsRouter } from '../../../apps/_common/helpers/create-model-reactions-router.helper.';
import { createCommonGenericModelReactionsService } from '../../../apps/_common/helpers/create-model-reactions-service.helper';
import { createModelRouteGuards } from '../../../apps/_common/helpers/create-model-guards.helper';
import { get_post_by_id } from '../repos/posts.repo';
import { MODERN_APP_NAMES } from '../../../apps/_common/enums/common.enum';
import { HOTSPOT_EVENT_TYPES, HOTSPOT_NOTIFICATION_TARGET_TYPES } from '../enums/hotspot.enum';
import { populate_hotspot_notification_obj } from '../hotspot.chamber';
import { createCommonGenericModelReactionsRequestHandler } from 'src/apps/_common/helpers/create-model-reactions-request-handler.helper';
import { createCommonGenericModelCommentsRequestHandler } from 'src/apps/_common/helpers/create-model-comments-request-handler.helper';
import { createCommonGenericModelCommentRepliesRequestHandler } from 'src/apps/_common/helpers/create-model-comment-replies-request-handler.helper';



export const PostsRouter: Router = Router({ mergeParams: true });

const PostRouteGuards = createModelRouteGuards({
  get_model_fn: get_post_by_id,
  model_name: 'post',
  model_owner_field: 'owner_id',
  request_param_id_name: 'post_id',
});



// GET Routes
PostsRouter.get('/:post_id', PostRouteGuards.existsGuard, PostsService.get_post_by_id);


// POST Routes
PostsRouter.post('/owner/:you_id', YouAuthorized, PostsService.create_post);


// PUT Routes
PostsRouter.put('/:post_id/owner/:you_id', YouAuthorized, PostRouteGuards.existsGuard, PostRouteGuards.isOwnerGuard, PostsService.update_post);


// DELETE Routes
PostsRouter.delete('/:post_id/owner/:you_id', YouAuthorized, PostRouteGuards.existsGuard, PostRouteGuards.isOwnerGuard, PostsService.delete_post);





/* --- Post Reactions --- */

const PostReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'post',
  micro_app: MODERN_APP_NAMES.HOTSPOT,
  reactionEvents: {
    REACTED: HOTSPOT_EVENT_TYPES.NEW_POST_REACTION,
    UNREACTED: HOTSPOT_EVENT_TYPES.NEW_POST_UNREACTION,
    CHANGE_REACTED: HOTSPOT_EVENT_TYPES.NEW_POST_CHANGED_REACTION,
  },
  target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.POST,
  populate_notification_fn: populate_hotspot_notification_obj,
  reaction_model: HotspotPostReactions,
});
const PostReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'post',
  reactionsService: PostReactionsService,
});
const PostReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: PostReactionsRequestHandler,
});
PostsRouter.use('/:post_id', PostRouteGuards.existsGuard, PostReactionsRouter);



/* --- Post Comments --- */

const PostCommentsService = createCommonGenericModelCommentsService({
  base_model_name: 'post',
  micro_app: MODERN_APP_NAMES.HOTSPOT,
  create_model_event: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT,
  target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.POST,
  populate_notification_fn: populate_hotspot_notification_obj,
  comment_model: HotspotPostComments,
});
const PostCommentsGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return HotspotPostComments.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    })
  },
  model_name: 'comment',
  model_owner_field: 'owner_id',
  request_param_id_name: 'comment_id',
});
const PostCommentsRequestHandler = createCommonGenericModelCommentsRequestHandler({
  base_model_name: 'post',
  commentsService: PostCommentsService
});
const PostCommentsRouter = createGenericCommentsRouter({
  commentsRequestHandler: PostCommentsRequestHandler,
  commentGuardsOpts: PostCommentsGuard,
});
PostsRouter.use(`/:post_id/comments`, PostRouteGuards.existsGuard, PostCommentsRouter);



/* --- Post Comment Reactions --- */

const PostCommentReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'post',
  micro_app: MODERN_APP_NAMES.HOTSPOT,
  reactionEvents: {
    REACTED: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_REACTION,
    UNREACTED: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_UNREACTION,
    CHANGE_REACTED: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_CHANGED_REACTION,
  },
  target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.POST_COMMENT,
  populate_notification_fn: populate_hotspot_notification_obj,
  reaction_model: HotspotPostCommentReactions
});
const PostCommentReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'post',
  reactionsService: PostCommentReactionsService
});
const PostCommentReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: PostCommentReactionsRequestHandler,
});
PostsRouter.use(`/:post_id/comments/:comment_id`, PostRouteGuards.existsGuard, PostCommentsGuard.existsGuard, PostCommentReactionsRouter);




/* --- Post Comment Replies --- */

const PostCommentRepliesService = createCommonGenericModelCommentRepliesService({
  micro_app: MODERN_APP_NAMES.HOTSPOT,
  create_model_event: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_REPLY,
  target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.POST_COMMENT_REPLY,
  populate_notification_fn: populate_hotspot_notification_obj,
  comment_reply_model: HotspotPostCommentReplies,
});
const PostCommentReplyGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return HotspotPostCommentReplies.findOne({
      where: { id },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    })
  },
  model_name: 'reply',
  model_owner_field: 'owner_id',
  request_param_id_name: 'reply_id',
});
const PostCommentRepliesRequestHandler = createCommonGenericModelCommentRepliesRequestHandler({
  commentRepliesService: PostCommentRepliesService,
});
const PostCommentRepliesRouter = createGenericCommentRepliesRouter({
  repliesRequestHandler: PostCommentRepliesRequestHandler,
  replyGuardsOpts: PostCommentReplyGuard,
});
PostsRouter.use(`/:post_id/comments/:comment_id/replies`, PostRouteGuards.existsGuard, PostCommentsGuard.existsGuard, PostCommentRepliesRouter);



/* --- Post Comment Reply Reactions --- */

const PostCommentReplyReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'post',
  micro_app: MODERN_APP_NAMES.HOTSPOT,
  reactionEvents: {
    REACTED: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_REPLY_REACTION,
    UNREACTED: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_REPLY_UNREACTION,
    CHANGE_REACTED: HOTSPOT_EVENT_TYPES.NEW_POST_COMMENT_REPLY_CHANGED_REACTION,
  },
  target_type: HOTSPOT_NOTIFICATION_TARGET_TYPES.POST_COMMENT_REPLY,
  populate_notification_fn: populate_hotspot_notification_obj,
  reaction_model: HotspotPostCommentReplyReactions
});
const PostCommentReplyReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'post',
  reactionsService: PostCommentReplyReactionsService,
});
const PostCommentReplyReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: PostCommentReplyReactionsRequestHandler,
});
PostsRouter.use(`/:post_id/comments/:comment_id/replies/:reply_id`, PostRouteGuards.existsGuard, PostCommentsGuard.existsGuard, PostCommentReplyGuard.existsGuard, PostCommentReplyReactionsRouter);
