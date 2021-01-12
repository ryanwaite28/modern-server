import { Router } from 'express';
import { PostsService } from '../services/posts.service';
import {
  PostExists,
  IsPostOwner
} from '../guards/post.guard';
import {
  UserAuthorizedSlim,
  UserExists
} from '../guards/user.guard';
import { CommentsRouter } from './post-comments.router';



export const PostsRouter: Router = Router({ mergeParams: true });

// GET Routes

PostsRouter.get('/:post_id', PostExists, PostsService.get_post_by_id);
PostsRouter.get('/:post_id/user-reactions/count', PostExists, PostsService.get_post_reactions_counts);
PostsRouter.get('/:post_id/user-reactions/all', PostExists, PostsService.get_post_reactions_all);
PostsRouter.get('/:post_id/user-reactions', PostExists, PostsService.get_post_reactions);
PostsRouter.get('/:post_id/user-reactions/:post_reaction_id', PostExists, PostsService.get_post_reactions);
PostsRouter.get('/:post_id/user-reaction/:user_id', UserExists, PostExists, PostsService.get_user_reaction);

// POST Routes

PostsRouter.post('/', UserAuthorizedSlim, PostsService.create_post);

// PUT Routes

PostsRouter.put('/:post_id', UserAuthorizedSlim, PostExists, IsPostOwner, PostsService.update_post);
PostsRouter.put('/:post_id/user-reaction', UserAuthorizedSlim, PostExists, PostsService.toggle_user_reaction);

// DELETE Routes

PostsRouter.delete('/:post_id', UserAuthorizedSlim, PostExists, IsPostOwner, PostsService.delete_post);

// Sub-Routes

PostsRouter.use(`/:post_id/comments`, CommentsRouter);