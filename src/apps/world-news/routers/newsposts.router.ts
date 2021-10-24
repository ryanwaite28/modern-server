
import { YouAuthorized } from '../../_common/guards/user.guard';
import { WORLDNEWS_EVENT_TYPES } from '../enum/world-news.enum';
import { NewsPostExists, IsNewsPostOwner } from '../guards/newspost.guard';
import { NewsPostsRequestHandler } from '../handlers/newsposts.handler';
import { NewsPostCommentReactions, NewsPostCommentReplies, NewsPostCommentReplyReactions, NewsPostComments, NewsPostReactions } from '../models/newspost.model';
import { get_newspost_by_id } from '../repos/newsposts.repo';
import { populate_worldnews_notification_obj } from '../worldnews.chamber';
import { MountGenericModelSocialRouterServiceHandler } from '../../_common/helpers/mount-model-social-router-service-handler.helper';
import { Router } from 'express';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { createModelRouteGuards } from '../../_common/helpers/create-model-guards.helper';



export const NewsPostsRouter: Router = Router();

const NewsPostRouteGuards = createModelRouteGuards({
  get_model_fn: get_newspost_by_id,
  model_name: 'newspost',
  model_owner_field: 'owner_id',
  request_param_id_name: 'newspost_id',
});



NewsPostsRouter.get('/get_random_newsposts', NewsPostsRequestHandler.get_random_newsposts);

NewsPostsRouter.get('/:newspost_id', NewsPostExists, NewsPostsRequestHandler.get_newspost_by_id);

// POST Routes

NewsPostsRouter.post('/owner/:you_id', YouAuthorized, NewsPostsRequestHandler.create_newspost);

// PUT Routes

NewsPostsRouter.put('/:newspost_id/owner/:you_id', YouAuthorized, NewsPostExists, IsNewsPostOwner, NewsPostsRequestHandler.update_newspost);

// DELETE Routes

NewsPostsRouter.delete('/:newspost_id/owner/:you_id', YouAuthorized, NewsPostExists, IsNewsPostOwner, NewsPostsRequestHandler.delete_newspost);





MountGenericModelSocialRouterServiceHandler({
  base_model_name: `newspost`,
  base_model_route_guards: NewsPostRouteGuards,
  mountingRouter: NewsPostsRouter,
  micro_app: MODERN_APP_NAMES.WORLDNEWS,
  eventsEnumObj: WORLDNEWS_EVENT_TYPES,
  populate_notification_fn: populate_worldnews_notification_obj,
  models: {
    base_reactions_model: NewsPostReactions,
    base_comments_model: NewsPostComments,
    base_comment_reactions_model: NewsPostCommentReactions,
    base_comment_replies_model: NewsPostCommentReplies,
    base_comment_reply_reactions_model: NewsPostCommentReplyReactions,
  }
});
