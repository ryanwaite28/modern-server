import { Router } from 'express';
import { HotspotPostsService } from '../services/posts.service';
import {
  UserAuthorized,
  UserAuthorizedSlim,
  UserExists
} from '../../_common/guards/user.guard';
import { user_attrs_slim } from '../../../apps/_common/common.chamber';
import { createCommonGenericModelCommentRepliesService } from '../../../apps/_common/helpers/create-model-comment-replies-service.helper';
import { createGenericCommentsRouter } from '../../../apps/_common/helpers/create-model-comments-router.helper';
import { createCommonGenericModelCommentsService } from '../../../apps/_common/helpers/create-model-comments-service.helper';
import { Users } from '../../../apps/_common/models/user.model';
import { HotspotPostComments, HotspotPostCommentReactions, HotspotPostCommentReplies, HotspotPostCommentReplyReactions, HotspotPostReactions } from '../models/post.model';
import { createGenericCommentRepliesRouter } from 'src/apps/_common/helpers/create-model-comment-replies-router.helper';
import { createCommonGenericModelReactionsRouter } from 'src/apps/_common/helpers/create-model-reactions-router.helper.';
import { createCommonGenericModelReactionsService } from 'src/apps/_common/helpers/create-model-reactions-service.helper';
import { createModelRouteGuards } from 'src/apps/_common/helpers/create-model-guards.helper';
import { get_post_by_id } from '../repos/posts.repo';



export const PostsRouter: Router = Router({ mergeParams: true });

const postRouteGuards = createModelRouteGuards({
  get_model_fn: get_post_by_id,
  model_name: 'post',
  model_owner_field: 'owner_id',
  request_param_id_name: 'post_id',
});



// GET Routes
PostsRouter.get('/:post_id', postRouteGuards.existsGuard, HotspotPostsService.get_post_by_id);


// POST Routes
PostsRouter.post('/owner/:you_id', UserAuthorized, HotspotPostsService.create_post);


// PUT Routes
PostsRouter.put('/:post_id/owner/:you_id', UserAuthorized, postRouteGuards.existsGuard, postRouteGuards.isOwnerGuard, HotspotPostsService.update_post);
PostsRouter.put('/:post_id/user-reaction/user/:you_id', UserAuthorized, postRouteGuards.existsGuard, HotspotPostsService.toggle_user_reaction);


// DELETE Routes
PostsRouter.delete('/:post_id/owner/:you_id', UserAuthorized, postRouteGuards.existsGuard, postRouteGuards.isOwnerGuard, HotspotPostsService.delete_post);



/* --- Reactions --- */

const postReactionsService = createCommonGenericModelReactionsService({
  base_model_name: 'post',
  reaction_model: HotspotPostReactions
})
const ReactionsRouter = createCommonGenericModelReactionsRouter({
  base_model_name: 'post',
  makeGuard: false,
  modelGuardsOpts: postRouteGuards,
  reactionService: postReactionsService,
});
PostsRouter.use(ReactionsRouter);



/* --- Comments --- */

const PostCommentsService = createCommonGenericModelCommentsService({
  model_name: 'post',
  comment_model: HotspotPostComments,
  comment_reaction_model: HotspotPostCommentReactions
});
const PostCommentsRouter = createGenericCommentsRouter({
  commentsService: PostCommentsService,
  commentGuardsOpts: {
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
  },
});
PostsRouter.use(`/:post_id/comments`, PostCommentsRouter);



/* --- Comment Replies --- */

const PostCommentRepliesService = createCommonGenericModelCommentRepliesService({
  comment_reply_model: HotspotPostCommentReplies,
  comment_reply_reaction_model: HotspotPostCommentReplyReactions
});
const RepliesRouter = createGenericCommentRepliesRouter({
  repliesService: PostCommentRepliesService,
  replyGuardsOpts: {
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
  },
});
RepliesRouter.use(`/:post_id/comments/:comment_id/replies`, RepliesRouter);
