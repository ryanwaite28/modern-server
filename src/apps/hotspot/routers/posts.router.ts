import { Router } from "express";
import { MODERN_APP_NAMES } from "../../_common/enums/common.enum";
import { YouAuthorized } from "../../_common/guards/user.guard";
import { createModelRouteGuards } from "../../_common/helpers/create-model-guards.helper";
import { MountGenericModelSocialRouterServiceHandler } from "../../_common/helpers/mount-model-social-router-service-handler.helper";
import { HOTSPOT_EVENT_TYPES } from "../enums/hotspot.enum";
import { PostsRequestHandler } from "../handlers/posts.handler";
import { populate_hotspot_notification_obj } from "../hotspot.chamber";
import { HotspotPostReactions, HotspotPostComments, HotspotPostCommentReactions, HotspotPostCommentReplies, HotspotPostCommentReplyReactions } from "../models/post.model";
import { get_post_by_id } from "../repos/posts.repo";


export const PostsRouter: Router = Router({ mergeParams: true });

const PostRouteGuards = createModelRouteGuards({
  get_model_fn: get_post_by_id,
  model_name: 'post',
  model_owner_field: 'owner_id',
  request_param_id_name: 'post_id',
});



// GET Routes
PostsRouter.get('/:post_id', PostRouteGuards.existsGuard, PostsRequestHandler.get_post_by_id);


// POST Routes
PostsRouter.post('/owner/:you_id', YouAuthorized, PostsRequestHandler.create_post);


// PUT Routes
PostsRouter.put('/:post_id/owner/:you_id', YouAuthorized, PostRouteGuards.existsGuard, PostRouteGuards.isOwnerGuard, PostsRequestHandler.update_post);


// DELETE Routes
PostsRouter.delete('/:post_id/owner/:you_id', YouAuthorized, PostRouteGuards.existsGuard, PostRouteGuards.isOwnerGuard, PostsRequestHandler.delete_post);




MountGenericModelSocialRouterServiceHandler({
  base_model_name: `post`,
  base_model_route_guards: PostRouteGuards,
  mountingRouter: PostsRouter,
  micro_app: MODERN_APP_NAMES.HOTSPOT,
  eventsEnumObj: HOTSPOT_EVENT_TYPES,
  populate_notification_fn: populate_hotspot_notification_obj,
  models: {
    base_reactions_model: HotspotPostReactions,
    base_comments_model: HotspotPostComments,
    base_comment_reactions_model: HotspotPostCommentReactions,
    base_comment_replies_model: HotspotPostCommentReplies,
    base_comment_reply_reactions_model: HotspotPostCommentReplyReactions,
  }
});
