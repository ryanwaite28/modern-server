import { Router } from 'express';
import { PostCommentsService } from '../services/post-comments.service';
import {
  PostCommentExists,
  IsCommentOwner
} from '../guards/comment.guard';
import {
  UserAuthorizedSlim,
  UserExists
} from '../guards/user.guard';
import { RepliesRouter } from './post-comment-replies.router';



export const CommentsRouter: Router = Router({ mergeParams: true });

// GET Routes

CommentsRouter.get('/count', PostCommentsService.get_post_comments_count);
CommentsRouter.get('/all', PostCommentsService.get_post_comments_all);

CommentsRouter.get('/', PostCommentsService.get_post_comments);
CommentsRouter.get('/:comment_id', PostCommentExists, PostCommentsService.get_post_comments);
CommentsRouter.get('/:comment_id/user-reactions/count', PostCommentExists, PostCommentsService.get_comment_reactions_counts);
CommentsRouter.get('/:comment_id/user-reactions/all', PostCommentExists, PostCommentsService.get_comment_reactions_all);
CommentsRouter.get('/:comment_id/user-reactions', PostCommentExists, PostCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reactions/:comment_reaction_id', PostCommentExists, PostCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reaction/:user_id', UserExists, PostCommentExists, PostCommentsService.get_user_reaction);

// POST Routes

CommentsRouter.post('/', UserAuthorizedSlim, PostCommentsService.create_comment);

// PUT Routes

CommentsRouter.put('/:comment_id', UserAuthorizedSlim, PostCommentExists, IsCommentOwner, PostCommentsService.update_comment);
CommentsRouter.put('/:comment_id/user-reaction', UserAuthorizedSlim, PostCommentExists, PostCommentsService.toggle_user_reaction);

// DELETE Routes

CommentsRouter.delete('/:comment_id', UserAuthorizedSlim, PostCommentExists, IsCommentOwner, PostCommentsService.delete_comment);

// Sub-Routes

CommentsRouter.use(`/:comment_id/replies`, RepliesRouter);