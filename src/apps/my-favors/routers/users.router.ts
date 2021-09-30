import { Router } from 'express';
import { YouAuthorized, UserExists } from 'src/apps/_common/guards/user.guard';
import { FavorExists, IsFavorActive } from '../guards/favor.guard';
import { FavorsService } from '../services/favors.service';


export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-favors/all', UserExists, FavorsService.get_user_favors_all);
UsersRouter.get('/:user_id/get-favors', UserExists, FavorsService.get_user_favors);
UsersRouter.get('/:user_id/get-favors/:favor_id', UserExists, FavorsService.get_user_favors);

UsersRouter.get('/:user_id/get-favor-helpings/all', UserExists, FavorsService.get_user_favor_helpings_all);
UsersRouter.get('/:user_id/get-favor-helpings', UserExists, FavorsService.get_user_favor_helpings);
UsersRouter.get('/:user_id/get-favor-helpings/:favor_id', UserExists, FavorsService.get_user_favor_helpings);

UsersRouter.get('/:you_id/settings', YouAuthorized, FavorsService.get_settings);

UsersRouter.post('/:you_id/settings', YouAuthorized, FavorsService.update_settings);

UsersRouter.post('/:you_id/assign-favor/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsService.assign_favor);
UsersRouter.post('/:you_id/unassign-favor/:favor_id', YouAuthorized, FavorExists, FavorsService.unassign_favor);

UsersRouter.post('/:you_id/mark-favor-as-started/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsService.mark_favor_as_started);
UsersRouter.post('/:you_id/mark-favor-as-canceled/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsService.mark_favor_as_canceled);
UsersRouter.post('/:you_id/mark-favor-as-fulfilled/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsService.mark_favor_as_fulfilled);

UsersRouter.post('/:you_id/create-favor-update/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsService.create_favor_update);
// UsersRouter.post('/:you_id/add-fulfilled-picture/:favor_id', YouAuthorized, FavorExists, FavorsService.add_fulfilled_picture); 