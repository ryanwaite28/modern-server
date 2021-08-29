import { Router } from 'express';
import { UserAuthorized, UserExists } from '../../_common/guards/user.guard';
import { IsNewsPostOwner, NewsPostExists } from '../guards/newspost.guard';
import { NewsPostsService } from '../services/newsposts.service';
import { CommentsRouter } from './newspost-comments.router';

export const NewsPostsRouter: Router = Router();

NewsPostsRouter.get('/get_random_newsposts', NewsPostsService.get_random_newsposts);

NewsPostsRouter.get('/:newspost_id', NewsPostExists, NewsPostsService.get_newspost_by_id);
NewsPostsRouter.get('/:newspost_id/user-reactions/count', NewsPostExists, NewsPostsService.get_newspost_reactions_counts);
NewsPostsRouter.get('/:newspost_id/user-reactions/all', NewsPostExists, NewsPostsService.get_newspost_reactions_all);
NewsPostsRouter.get('/:newspost_id/user-reactions', NewsPostExists, NewsPostsService.get_newspost_reactions);
NewsPostsRouter.get('/:newspost_id/user-reactions/:newspost_reaction_id', NewsPostExists, NewsPostsService.get_newspost_reactions);
NewsPostsRouter.get('/:newspost_id/user-reaction/:user_id', UserExists, NewsPostExists, NewsPostsService.get_user_reaction);

// POST Routes

NewsPostsRouter.post('/owner/:you_id', UserAuthorized, NewsPostsService.create_newspost);

// PUT Routes

NewsPostsRouter.put('/:newspost_id/owner/:you_id', UserAuthorized, NewsPostExists, IsNewsPostOwner, NewsPostsService.update_newspost);
NewsPostsRouter.put('/:newspost_id/user-reaction/user/:you_id', UserAuthorized, NewsPostExists, NewsPostsService.toggle_user_reaction);

// DELETE Routes

NewsPostsRouter.delete('/:newspost_id/owner/:you_id', UserAuthorized, NewsPostExists, IsNewsPostOwner, NewsPostsService.delete_newspost);

// Sub-Routes

NewsPostsRouter.use(`/:newspost_id/comments`, CommentsRouter);