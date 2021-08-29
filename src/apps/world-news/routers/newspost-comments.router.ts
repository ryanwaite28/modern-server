import { Router } from 'express';
import { NewsPostCommentsService } from '../services/newspost-comments.service';
import {
  NewsPostCommentExists,
  IsCommentOwner
} from '../guards/comment.guard';
import {
  UserAuthorized,
  UserExists
} from '../../_common/guards/user.guard';
import { RepliesRouter } from './newspost-comment-replies.router';



export const CommentsRouter: Router = Router({ mergeParams: true });

// GET Routes

CommentsRouter.get('/count', NewsPostCommentsService.get_newspost_comments_count);
CommentsRouter.get('/all', NewsPostCommentsService.get_newspost_comments_all);

CommentsRouter.get('/', NewsPostCommentsService.get_newspost_comments);
CommentsRouter.get('/:comment_id', NewsPostCommentExists, NewsPostCommentsService.get_newspost_comments);
CommentsRouter.get('/:comment_id/user-reactions/count', NewsPostCommentExists, NewsPostCommentsService.get_comment_reactions_counts);
CommentsRouter.get('/:comment_id/user-reactions/all', NewsPostCommentExists, NewsPostCommentsService.get_comment_reactions_all);
CommentsRouter.get('/:comment_id/user-reactions', NewsPostCommentExists, NewsPostCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reactions/:comment_reaction_id', NewsPostCommentExists, NewsPostCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reaction/:user_id', UserExists, NewsPostCommentExists, NewsPostCommentsService.get_user_reaction);

// POST Routes

CommentsRouter.post('/owner/:you_id', UserAuthorized, NewsPostCommentsService.create_comment);

// PUT Routes

CommentsRouter.put('/:comment_id/owner/:you_id', UserAuthorized, NewsPostCommentExists, IsCommentOwner, NewsPostCommentsService.update_comment);
CommentsRouter.put('/:comment_id/user-reaction/user/:you_id', UserAuthorized, NewsPostCommentExists, NewsPostCommentsService.toggle_user_reaction);

// DELETE Routes

CommentsRouter.delete('/:comment_id/owner/:you_id', UserAuthorized, NewsPostCommentExists, IsCommentOwner, NewsPostCommentsService.delete_comment);

// Sub-Routes

CommentsRouter.use(`/:comment_id/replies`, RepliesRouter);