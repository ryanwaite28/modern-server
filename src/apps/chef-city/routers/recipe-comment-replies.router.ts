import { Router } from 'express';
import { IsReplyOwner } from '../../../apps/hotspot/guards/reply.guard';
import { UserExists, UserAuthorized } from '../../_common/guards/user.guard';
import { RecipeCommentReplyExists } from '../guards/recipe.guard';
import {
  RecipeCommentRepliesService
} from '../services/recipe-comment-replies.service';

export const RepliesRouter: Router = Router({ mergeParams: true });

// GET Routes

RepliesRouter.get('/count', RecipeCommentRepliesService.get_comment_replies_count);
RepliesRouter.get('/all', RecipeCommentRepliesService.get_comment_replies_all);

RepliesRouter.get('/', RecipeCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id', RecipeCommentReplyExists, RecipeCommentRepliesService.get_comment_replies);
RepliesRouter.get('/:reply_id/user-reactions/count', RecipeCommentReplyExists, RecipeCommentRepliesService.get_reply_reactions_counts);
RepliesRouter.get('/:reply_id/user-reactions/all', RecipeCommentReplyExists, RecipeCommentRepliesService.get_reply_reactions_all);
RepliesRouter.get('/:reply_id/user-reactions', RecipeCommentReplyExists, RecipeCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reactions/:reply_reaction_id', RecipeCommentReplyExists, RecipeCommentRepliesService.get_reply_reactions);
RepliesRouter.get('/:reply_id/user-reaction/:user_id', UserExists, RecipeCommentReplyExists, RecipeCommentRepliesService.get_user_reaction);

// POST Routes

RepliesRouter.post('/owner/:you_id', UserAuthorized, RecipeCommentRepliesService.create_reply);

// PUT Routes

RepliesRouter.put('/:reply_id/owner/:you_id', UserAuthorized, RecipeCommentReplyExists, IsReplyOwner, RecipeCommentRepliesService.update_reply);
RepliesRouter.put('/:reply_id/user-reaction/user/:you_id', UserAuthorized, RecipeCommentReplyExists, RecipeCommentRepliesService.toggle_user_reaction);

// DELETE Routes

RepliesRouter.delete('/:reply_id/owner/:you_id', UserAuthorized, RecipeCommentReplyExists, IsReplyOwner, RecipeCommentRepliesService.delete_reply);