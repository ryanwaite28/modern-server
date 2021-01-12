import { Router } from 'express';
import { RecipeCommentRepliesService } from '../services/recipe-comment-replies.service';
import {
  RecipeCommentReplyExists,
  IsReplyOwner
} from '../guards/reply.guard';
import {
  UserAuthorizedSlim,
  UserExists
} from '../guards/user.guard';



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

RepliesRouter.post('/', UserAuthorizedSlim, RecipeCommentRepliesService.create_reply);

// PUT Routes

RepliesRouter.put('/:reply_id', UserAuthorizedSlim, RecipeCommentReplyExists, IsReplyOwner, RecipeCommentRepliesService.update_reply);
RepliesRouter.put('/:reply_id/user-reaction', UserAuthorizedSlim, RecipeCommentReplyExists, RecipeCommentRepliesService.toggle_user_reaction);

// DELETE Routes

RepliesRouter.delete('/:reply_id', UserAuthorizedSlim, RecipeCommentReplyExists, IsReplyOwner, RecipeCommentRepliesService.delete_reply);