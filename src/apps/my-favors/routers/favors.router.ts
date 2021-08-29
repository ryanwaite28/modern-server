import { Router } from 'express';
import { FavorsService } from '../services/favors.service';
import {
  FavorExists,
  IsFavorOwner
} from '../guards/favor.guard';
import {
  UserAuthorized,
  UserExists
} from '../../_common/guards/user.guard';


export const FavorsRouter: Router = Router();

// GET Routes

// FavorsRouter.get('/random', FavorExists, FavorsService.get_random_favors);

// FavorsRouter.get('/:favor_id', FavorExists, FavorsService.get_favor_by_id);
// FavorsRouter.get('/:favor_id/user-reactions/count', FavorExists, FavorsService.get_favor_reactions_counts);
// FavorsRouter.get('/:favor_id/user-reactions/all', FavorExists, FavorsService.get_favor_reactions_all);
// FavorsRouter.get('/:favor_id/user-reactions', FavorExists, FavorsService.get_favor_reactions);
// FavorsRouter.get('/:favor_id/user-reactions/:favor_reaction_id', FavorExists, FavorsService.get_favor_reactions);
// FavorsRouter.get('/:favor_id/user-reaction/:user_id', UserExists, FavorExists, FavorsService.get_user_reaction);

// // POST Routes

// FavorsRouter.post('/owner/:you_id', UserAuthorized, FavorsService.create_favor);

// // PUT Routes

// FavorsRouter.put('/:favor_id/owner/:you_id', UserAuthorized, FavorExists, IsFavorOwner, FavorsService.update_favor);
// FavorsRouter.put('/:favor_id/user-reaction/user/:you_id', UserAuthorized, FavorExists, FavorsService.toggle_user_reaction);

// // DELETE Routes

// FavorsRouter.delete('/:favor_id/owner/:you_id', UserAuthorized, FavorExists, IsFavorOwner, FavorsService.delete_favor);
