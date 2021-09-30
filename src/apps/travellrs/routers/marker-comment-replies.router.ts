import { Router } from 'express';
import { MarkerCommentRepliesService } from '../services/marker-comment-replies.service';
import {
  MarkerCommentReplyExists,
  IsReplyOwner
} from '../guards/reply.guard';
import {
  YouAuthorized,
  UserExists
} from '../../_common/guards/user.guard';



export const RepliesRouter: Router = Router({ mergeParams: true });

// GET Routes

RepliesRouter.get('/count', MarkerCommentRepliesService.get_comment_replies_count);
RepliesRouter.get('/all', MarkerCommentRepliesService.get_comment_replies_all);

RepliesRouter.get('/', MarkerCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id', MarkerCommentReplyExists, MarkerCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id/user-reactions/count', MarkerCommentReplyExists, MarkerCommentRepliesService.get_reply_reactions_counts);
RepliesRouter.get('/:reply_id/user-reactions/all', MarkerCommentReplyExists, MarkerCommentRepliesService.get_reply_reactions_all);
RepliesRouter.get('/:reply_id/user-reactions', MarkerCommentReplyExists, MarkerCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reactions/:reply_reaction_id', MarkerCommentReplyExists, MarkerCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reaction/:user_id', UserExists, MarkerCommentReplyExists, MarkerCommentRepliesService.get_user_reaction);

// POST Routes

RepliesRouter.post('/owner/:you_id', YouAuthorized, MarkerCommentRepliesService.create_reply);

// PUT Routes

RepliesRouter.put('/:reply_id/owner/:you_id', YouAuthorized, MarkerCommentReplyExists, IsReplyOwner, MarkerCommentRepliesService.update_reply);
RepliesRouter.put('/:reply_id/user-reaction/user/:you_id', YouAuthorized, MarkerCommentReplyExists, MarkerCommentRepliesService.toggle_user_reaction);

// DELETE Routes

RepliesRouter.delete('/:reply_id/owner/:you_id', YouAuthorized, MarkerCommentReplyExists, IsReplyOwner, MarkerCommentRepliesService.delete_reply);