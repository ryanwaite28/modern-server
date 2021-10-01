import { Router } from 'express';
import { YouAuthorized, UserExists, YouHasStripeConnect } from '../../_common/guards/user.guard';
import { FavorExists, IsFavorActive, IsFavorNotCanceled, IsFavorOwner } from '../guards/favor.guard';
import { FavorsService } from '../services/favors.service';


export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-favors/all', UserExists, FavorsService.get_user_favors_all);
UsersRouter.get('/:user_id/get-favors', UserExists, FavorsService.get_user_favors);
UsersRouter.get('/:user_id/get-favors/:favor_id', UserExists, FavorsService.get_user_favors);

UsersRouter.get('/:user_id/get-favor-helpings-active/all', UserExists, FavorsService.get_user_favor_helpings_all_active);
UsersRouter.get('/:user_id/get-favor-helpings-active', UserExists, FavorsService.get_user_favor_helpings_active);
UsersRouter.get('/:user_id/get-favor-helpings-active/:favor_id', UserExists, FavorsService.get_user_favor_helpings_active);

UsersRouter.get('/:user_id/get-favor-helpings-past/all', UserExists, FavorsService.get_user_favor_helpings_all_past);
UsersRouter.get('/:user_id/get-favor-helpings-past', UserExists, FavorsService.get_user_favor_helpings_past);
UsersRouter.get('/:user_id/get-favor-helpings-past/:favor_id', UserExists, FavorsService.get_user_favor_helpings_past);


UsersRouter.get('/:you_id/settings', YouAuthorized, FavorsService.get_settings);

UsersRouter.post('/:you_id/settings', YouAuthorized, FavorsService.update_settings);

UsersRouter.post('/:you_id/assign-favor/:favor_id', YouAuthorized, YouHasStripeConnect, FavorExists, IsFavorActive, FavorsService.assign_favor);
UsersRouter.post('/:you_id/unassign-favor/:favor_id', YouAuthorized, YouHasStripeConnect, FavorExists, FavorsService.unassign_favor);

UsersRouter.post('/:you_id/mark-favor-as-started/:favor_id', YouAuthorized, FavorExists, IsFavorActive, IsFavorNotCanceled, FavorsService.mark_favor_as_started);
UsersRouter.post('/:you_id/mark-favor-as-canceled/:favor_id', YouAuthorized, FavorExists, IsFavorOwner, IsFavorActive, FavorsService.mark_favor_as_canceled);
UsersRouter.post('/:you_id/mark-favor-as-uncanceled/:favor_id', YouAuthorized, FavorExists, IsFavorOwner, IsFavorActive, FavorsService.mark_favor_as_uncanceled);
UsersRouter.post('/:you_id/mark-favor-as-fulfilled/:favor_id', YouAuthorized, FavorExists, IsFavorActive, IsFavorNotCanceled, FavorsService.mark_favor_as_fulfilled);

UsersRouter.post('/:you_id/create-favor-update/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsService.create_favor_update);
// UsersRouter.post('/:you_id/add-fulfilled-picture/:favor_id', YouAuthorized, FavorExists, FavorsService.add_fulfilled_picture); 