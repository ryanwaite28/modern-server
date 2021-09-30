import { Router } from 'express';
import { NewsPostCommentRepliesService } from '../services/newspost-comment-replies.service';
import {
  IsReplyOwner, NewsPostCommentReplyExists
} from '../guards/reply.guard';
import {
  YouAuthorized,
  UserExists
} from '../../_common/guards/user.guard';



export const RepliesRouter: Router = Router({ mergeParams: true });

// GET Routes

RepliesRouter.get('/count', NewsPostCommentRepliesService.get_comment_replies_count);
RepliesRouter.get('/all', NewsPostCommentRepliesService.get_comment_replies_all);

RepliesRouter.get('/', NewsPostCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id', NewsPostCommentReplyExists, NewsPostCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id/user-reactions/count', NewsPostCommentReplyExists, NewsPostCommentRepliesService.get_reply_reactions_counts);
RepliesRouter.get('/:reply_id/user-reactions/all', NewsPostCommentReplyExists, NewsPostCommentRepliesService.get_reply_reactions_all);
RepliesRouter.get('/:reply_id/user-reactions', NewsPostCommentReplyExists, NewsPostCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reactions/:reply_reaction_id', NewsPostCommentReplyExists, NewsPostCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reaction/:user_id', UserExists, NewsPostCommentReplyExists, NewsPostCommentRepliesService.get_user_reaction);

// POST Routes

RepliesRouter.post('/owner/:you_id', YouAuthorized, NewsPostCommentRepliesService.create_reply);

// PUT Routes

RepliesRouter.put('/:reply_id/owner/:you_id', YouAuthorized, NewsPostCommentReplyExists, IsReplyOwner, NewsPostCommentRepliesService.update_reply);
RepliesRouter.put('/:reply_id/user-reaction/user/:you_id', YouAuthorized, NewsPostCommentReplyExists, NewsPostCommentRepliesService.toggle_user_reaction);

// DELETE Routes

RepliesRouter.delete('/:reply_id/owner/:you_id', YouAuthorized, NewsPostCommentReplyExists, IsReplyOwner, NewsPostCommentRepliesService.delete_reply);