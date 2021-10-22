import { Router } from 'express';
import { populate_hotspot_notification_obj } from 'src/apps/hotspot/hotspot.chamber';
import { user_attrs_slim } from 'src/apps/_common/common.chamber';
import { MODERN_APP_NAMES } from 'src/apps/_common/enums/common.enum';
import { createCommonGenericModelCommentRepliesRequestHandler } from 'src/apps/_common/helpers/create-model-comment-replies-request-handler.helper';
import { createGenericCommentRepliesRouter } from 'src/apps/_common/helpers/create-model-comment-replies-router.helper';
import { createCommonGenericModelCommentRepliesService } from 'src/apps/_common/helpers/create-model-comment-replies-service.helper';
import { createCommonGenericModelCommentsRequestHandler } from 'src/apps/_common/helpers/create-model-comments-request-handler.helper';
import { createGenericCommentsRouter } from 'src/apps/_common/helpers/create-model-comments-router.helper';
import { createCommonGenericModelCommentsService } from 'src/apps/_common/helpers/create-model-comments-service.helper';
import { createModelRouteGuards } from 'src/apps/_common/helpers/create-model-guards.helper';
import { createCommonGenericModelReactionsRequestHandler } from 'src/apps/_common/helpers/create-model-reactions-request-handler.helper';
import { createCommonGenericModelReactionsRouter } from 'src/apps/_common/helpers/create-model-reactions-router.helper.';
import { createCommonGenericModelReactionsService } from 'src/apps/_common/helpers/create-model-reactions-service.helper';
import { Users } from 'src/apps/_common/models/user.model';
import { YouAuthorized } from '../../_common/guards/user.guard';
import { WORLD_NEWS_EVENT_TYPES, WORLD_NEWS_NOTIFICATION_TARGET_TYPES } from '../enum/world-news.enum';
import { NewsPostExists, IsNewsPostOwner } from '../guards/newspost.guard';
import { NewsPostsRequestHandler } from '../handlers/newsposts.handler';
import { NewsPostCommentReactions, NewsPostCommentReplies, NewsPostCommentReplyReactions, NewsPostComments, NewsPostReactions } from '../models/newspost.model';
import { get_newspost_by_id } from '../repos/newsposts.repo';



export const NewsPostsRouter: Router = Router();

const NewsPostRouteGuards = createModelRouteGuards({
  get_model_fn: get_newspost_by_id,
  model_name: 'newspost',
  model_owner_field: 'owner_id',
  request_param_id_name: 'newspost_id',
});



NewsPostsRouter.get('/get_random_newsposts', NewsPostsRequestHandler.get_random_newsposts);

NewsPostsRouter.get('/:newspost_id', NewsPostExists, NewsPostsRequestHandler.get_newspost_by_id);

// NEWS_POST Routes

NewsPostsRouter.post('/owner/:you_id', YouAuthorized, NewsPostsRequestHandler.create_newspost);

// PUT Routes

NewsPostsRouter.put('/:newspost_id/owner/:you_id', YouAuthorized, NewsPostExists, IsNewsPostOwner, NewsPostsRequestHandler.update_newspost);

// DELETE Routes

NewsPostsRouter.delete('/:newspost_id/owner/:you_id', YouAuthorized, NewsPostExists, IsNewsPostOwner, NewsPostsRequestHandler.delete_newspost);




/* --- NewsPost Reactions --- */

const NewsPostReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'newspost',
  micro_app: MODERN_APP_NAMES.WORLDNEWS,
  reactionEvents: {
    REACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_REACTION,
    UNREACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_UNREACTION,
    CHANGE_REACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_CHANGED_REACTION,
  },
  target_type: WORLD_NEWS_NOTIFICATION_TARGET_TYPES.NEWS_POST,
  populate_notification_fn: populate_hotspot_notification_obj,
  reaction_model: NewsPostReactions,
});
const NewsPostReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'newspost',
  reactionsService: NewsPostReactionsService,
});
const NewsPostReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: NewsPostReactionsRequestHandler,
});
NewsPostsRouter.use('/:newspost_id', NewsPostRouteGuards.existsGuard, NewsPostReactionsRouter);



/* --- NewsPost Comments --- */

const NewsPostCommentsService = createCommonGenericModelCommentsService({
  base_model_name: 'newspost',
  micro_app: MODERN_APP_NAMES.WORLDNEWS,
  create_model_event: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT,
  target_type: WORLD_NEWS_NOTIFICATION_TARGET_TYPES.NEWS_POST,
  populate_notification_fn: populate_hotspot_notification_obj,
  comment_model: NewsPostComments,
});
const NewsPostCommentsGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return NewsPostComments.findOne({
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
const NewsPostCommentsRequestHandler = createCommonGenericModelCommentsRequestHandler({
  base_model_name: 'newspost',
  commentsService: NewsPostCommentsService
});
const NewsPostCommentsRouter = createGenericCommentsRouter({
  commentsRequestHandler: NewsPostCommentsRequestHandler,
  commentGuardsOpts: NewsPostCommentsGuard,
});
NewsPostsRouter.use(`/:newspost_id/comments`, NewsPostRouteGuards.existsGuard, NewsPostCommentsRouter);



/* --- NewsPost Comment Reactions --- */

const NewsPostCommentReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'newspost',
  micro_app: MODERN_APP_NAMES.WORLDNEWS,
  reactionEvents: {
    REACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_REACTION,
    UNREACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_UNREACTION,
    CHANGE_REACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_CHANGED_REACTION,
  },
  target_type: WORLD_NEWS_NOTIFICATION_TARGET_TYPES.NEWS_POST_COMMENT,
  populate_notification_fn: populate_hotspot_notification_obj,
  reaction_model: NewsPostCommentReactions
});
const NewsPostCommentReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'newspost',
  reactionsService: NewsPostCommentReactionsService
});
const NewsPostCommentReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: NewsPostCommentReactionsRequestHandler,
});
NewsPostsRouter.use(`/:newspost_id/comments/:comment_id`, NewsPostRouteGuards.existsGuard, NewsPostCommentsGuard.existsGuard, NewsPostCommentReactionsRouter);




/* --- NewsPost Comment Replies --- */

const NewsPostCommentRepliesService = createCommonGenericModelCommentRepliesService({
  micro_app: MODERN_APP_NAMES.WORLDNEWS,
  create_model_event: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_REPLY,
  target_type: WORLD_NEWS_NOTIFICATION_TARGET_TYPES.NEWS_POST_COMMENT_REPLY,
  populate_notification_fn: populate_hotspot_notification_obj,
  comment_reply_model: NewsPostCommentReplies,
});
const NewsPostCommentReplyGuard = createModelRouteGuards({
  get_model_fn: (id: number) => {
    return NewsPostCommentReplies.findOne({
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
const NewsPostCommentRepliesRequestHandler = createCommonGenericModelCommentRepliesRequestHandler({
  commentRepliesService: NewsPostCommentRepliesService,
});
const NewsPostCommentRepliesRouter = createGenericCommentRepliesRouter({
  repliesRequestHandler: NewsPostCommentRepliesRequestHandler,
  replyGuardsOpts: NewsPostCommentReplyGuard,
});
NewsPostsRouter.use(`/:newspost_id/comments/:comment_id/replies`, NewsPostRouteGuards.existsGuard, NewsPostCommentsGuard.existsGuard, NewsPostCommentRepliesRouter);



/* --- NewsPost Comment Reply Reactions --- */

const NewsPostCommentReplyReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'newspost',
  micro_app: MODERN_APP_NAMES.WORLDNEWS,
  reactionEvents: {
    REACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_REPLY_REACTION,
    UNREACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_REPLY_UNREACTION,
    CHANGE_REACTED: WORLD_NEWS_EVENT_TYPES.NEW_NEWS_POST_COMMENT_REPLY_CHANGED_REACTION,
  },
  target_type: WORLD_NEWS_NOTIFICATION_TARGET_TYPES.NEWS_POST_COMMENT_REPLY,
  populate_notification_fn: populate_hotspot_notification_obj,
  reaction_model: NewsPostCommentReplyReactions
});
const NewsPostCommentReplyReactionsRequestHandler = createCommonGenericModelReactionsRequestHandler({
  base_model_name: 'newspost',
  reactionsService: NewsPostCommentReplyReactionsService,
});
const NewsPostCommentReplyReactionsRouter = createCommonGenericModelReactionsRouter({
  reactionRequestHandler: NewsPostCommentReplyReactionsRequestHandler,
});
NewsPostsRouter.use(`/:newspost_id/comments/:comment_id/replies/:reply_id`, NewsPostRouteGuards.existsGuard, NewsPostCommentsGuard.existsGuard, NewsPostCommentReplyGuard.existsGuard, NewsPostCommentReplyReactionsRouter);
