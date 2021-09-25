import { Router } from 'express';
import { PostsService } from '../services/posts.service';
import {
  PostExists,
  IsPostOwner
} from '../guards/post.guard';
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
import { PostComments, PostCommentReactions, PostCommentReplies, PostCommentReplyReactions } from '../models/post.model';



export const PostsRouter: Router = Router({ mergeParams: true });

// GET Routes

PostsRouter.get('/:post_id', PostExists, PostsService.get_post_by_id);
PostsRouter.get('/:post_id/user-reactions/count', PostExists, PostsService.get_post_reactions_counts);
PostsRouter.get('/:post_id/user-reactions/all', PostExists, PostsService.get_post_reactions_all);
PostsRouter.get('/:post_id/user-reactions', PostExists, PostsService.get_post_reactions);
PostsRouter.get('/:post_id/user-reactions/:post_reaction_id', PostExists, PostsService.get_post_reactions);
PostsRouter.get('/:post_id/user-reaction/:user_id', UserExists, PostExists, PostsService.get_user_reaction);

// POST Routes

PostsRouter.post('/owner/:you_id', UserAuthorized, PostsService.create_post);

// PUT Routes

PostsRouter.put('/:post_id/owner/:you_id', UserAuthorized, PostExists, IsPostOwner, PostsService.update_post);
PostsRouter.put('/:post_id/user-reaction/user/:you_id', UserAuthorized, PostExists, PostsService.toggle_user_reaction);

// DELETE Routes

PostsRouter.delete('/:post_id/owner/:you_id', UserAuthorized, PostExists, IsPostOwner, PostsService.delete_post);





/* --- Comments --- */

const PostCommentsService = createCommonGenericModelCommentsService({
  model_name: 'Post',
  comment_model: PostComments,
  comment_reaction_model: PostCommentReactions
});
const PostCommentRepliesService = createCommonGenericModelCommentRepliesService({
  model_name: 'Post',
  reply_model: PostCommentReplies,
  reply_reaction_model: PostCommentReplyReactions
});

const PostCommentsRouter = createGenericCommentsRouter({
  generateRepliesRouter: true,

  // comments router config
  commentsService: PostCommentsService,
  commentGuardsOpts: {
    get_model_fn: (id: number) => {
      return PostComments.findOne({
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

  // reply router config
  repliesService: PostCommentRepliesService,
  replyGuardsOpts: {
    get_model_fn: (id) => {
      return PostCommentReplies.findOne({
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


PostsRouter.use(`/:post_id/comments`, PostCommentsRouter);