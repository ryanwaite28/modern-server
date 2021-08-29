import { Router } from 'express';
import { MarkerCommentsService } from '../services/marker-comments.service';
import {
  MarkerCommentExists,
  IsCommentOwner
} from '../guards/comment.guard';
import {
  UserAuthorized,
  UserExists
} from '../../_common/guards/user.guard';
import { RepliesRouter } from './marker-comment-replies.router';



export const CommentsRouter: Router = Router({ mergeParams: true });

// GET Routes

CommentsRouter.get('/count', MarkerCommentsService.get_marker_comments_count);
CommentsRouter.get('/all', MarkerCommentsService.get_marker_comments_all);

CommentsRouter.get('/', MarkerCommentsService.get_marker_comments);
CommentsRouter.get('/:comment_id', MarkerCommentExists, MarkerCommentsService.get_marker_comments);
CommentsRouter.get('/:comment_id/user-reactions/count', MarkerCommentExists, MarkerCommentsService.get_comment_reactions_counts);
CommentsRouter.get('/:comment_id/user-reactions/all', MarkerCommentExists, MarkerCommentsService.get_comment_reactions_all);
CommentsRouter.get('/:comment_id/user-reactions', MarkerCommentExists, MarkerCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reactions/:comment_reaction_id', MarkerCommentExists, MarkerCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reaction/:user_id', UserExists, MarkerCommentExists, MarkerCommentsService.get_user_reaction);

// POST Routes

CommentsRouter.post('/owner/:you_id', UserAuthorized, MarkerCommentsService.create_comment);

// PUT Routes

CommentsRouter.put('/:comment_id/owner/:you_id', UserAuthorized, MarkerCommentExists, IsCommentOwner, MarkerCommentsService.update_comment);
CommentsRouter.put('/:comment_id/user-reaction/user/:you_id', UserAuthorized, MarkerCommentExists, MarkerCommentsService.toggle_user_reaction);

// DELETE Routes

CommentsRouter.delete('/:comment_id/owner/:you_id', UserAuthorized, MarkerCommentExists, IsCommentOwner, MarkerCommentsService.delete_comment);

// Sub-Routes

CommentsRouter.use(`/:comment_id/replies`, RepliesRouter);