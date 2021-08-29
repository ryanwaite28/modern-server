import { Router } from 'express';
import { PostCommentRepliesService } from '../services/post-comment-replies.service';
import {
  PostCommentReplyExists,
  IsReplyOwner
} from '../guards/reply.guard';
import {
  UserAuthorized,
  UserExists
} from '../../_common/guards/user.guard';



export const RepliesRouter: Router = Router({ mergeParams: true });

// GET Routes

RepliesRouter.get('/count', PostCommentRepliesService.get_comment_replies_count);
RepliesRouter.get('/all', PostCommentRepliesService.get_comment_replies_all);

RepliesRouter.get('/', PostCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id', PostCommentReplyExists, PostCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id/user-reactions/count', PostCommentReplyExists, PostCommentRepliesService.get_reply_reactions_counts);
RepliesRouter.get('/:reply_id/user-reactions/all', PostCommentReplyExists, PostCommentRepliesService.get_reply_reactions_all);
RepliesRouter.get('/:reply_id/user-reactions', PostCommentReplyExists, PostCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reactions/:reply_reaction_id', PostCommentReplyExists, PostCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reaction/:user_id', UserExists, PostCommentReplyExists, PostCommentRepliesService.get_user_reaction);

// POST Routes

RepliesRouter.post('/owner/:you_id', UserAuthorized, PostCommentRepliesService.create_reply);

// PUT Routes

RepliesRouter.put('/:reply_id/owner/:you_id', UserAuthorized, PostCommentReplyExists, IsReplyOwner, PostCommentRepliesService.update_reply);
RepliesRouter.put('/:reply_id/user-reaction/user/:you_id', UserAuthorized, PostCommentReplyExists, PostCommentRepliesService.toggle_user_reaction);

// DELETE Routes

RepliesRouter.delete('/:reply_id/owner/:you_id', UserAuthorized, PostCommentReplyExists, IsReplyOwner, PostCommentRepliesService.delete_reply);