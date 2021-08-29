import { Router } from 'express';
import { IsCommentOwner } from '../../../apps/hotspot/guards/comment.guard';
import { UserExists, UserAuthorized } from '../../_common/guards/user.guard';
import { RecipeCommentExists } from '../guards/recipe.guard';
import { RecipeCommentsService } from '../services/recipe-comments.service';
import { RepliesRouter } from './recipe-comment-replies.router';



export const CommentsRouter: Router = Router({ mergeParams: true });

// GET Routes

CommentsRouter.get('/count', RecipeCommentsService.get_recipe_comments_count);
CommentsRouter.get('/all', RecipeCommentsService.get_recipe_comments_all);

CommentsRouter.get('/', RecipeCommentsService.get_recipe_comments);
CommentsRouter.get('/:comment_id', RecipeCommentExists, RecipeCommentsService.get_recipe_comments);
CommentsRouter.get('/:comment_id/user-reactions/count', RecipeCommentExists, RecipeCommentsService.get_comment_reactions_counts);
CommentsRouter.get('/:comment_id/user-reactions/all', RecipeCommentExists, RecipeCommentsService.get_comment_reactions_all);
CommentsRouter.get('/:comment_id/user-reactions', RecipeCommentExists, RecipeCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reactions/:comment_reaction_id', RecipeCommentExists, RecipeCommentsService.get_comment_reactions);
CommentsRouter.get('/:comment_id/user-reaction/:user_id', UserExists, RecipeCommentExists, RecipeCommentsService.get_user_reaction);

// POST Routes

CommentsRouter.post('/owner/:you_id', UserAuthorized, RecipeCommentsService.create_comment);

// PUT Routes

CommentsRouter.put('/:comment_id/owner/:you_id', UserAuthorized, RecipeCommentExists, IsCommentOwner, RecipeCommentsService.update_comment);
CommentsRouter.put('/:comment_id/user-reaction/user/:you_id', UserAuthorized, RecipeCommentExists, RecipeCommentsService.toggle_user_reaction);

// DELETE Routes

CommentsRouter.delete('/:comment_id/owner/:you_id', UserAuthorized, RecipeCommentExists, IsCommentOwner, RecipeCommentsService.delete_comment);

// Sub-Routes

CommentsRouter.use(`/:comment_id/replies`, RepliesRouter);