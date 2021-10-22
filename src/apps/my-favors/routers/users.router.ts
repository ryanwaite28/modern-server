import { Router } from 'express';
import { YouAuthorized, UserExists, YouHasStripeConnect } from '../../_common/guards/user.guard';
import { FavorExists, IsFavorActive, IsFavorNotCanceled, IsFavorOwner } from '../guards/favor.guard';
import { FavorsRequestHandler } from '../handlers/favors.handler';


export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-favors/all', UserExists, FavorsRequestHandler.get_user_favors_all);
UsersRouter.get('/:user_id/get-favors', UserExists, FavorsRequestHandler.get_user_favors);
UsersRouter.get('/:user_id/get-favors/:favor_id', UserExists, FavorsRequestHandler.get_user_favors);

UsersRouter.get('/:user_id/get-favor-helpings-active/all', UserExists, FavorsRequestHandler.get_user_favor_helpings_all_active);
UsersRouter.get('/:user_id/get-favor-helpings-active', UserExists, FavorsRequestHandler.get_user_favor_helpings_active);
UsersRouter.get('/:user_id/get-favor-helpings-active/:favor_id', UserExists, FavorsRequestHandler.get_user_favor_helpings_active);

UsersRouter.get('/:user_id/get-favor-helpings-past/all', UserExists, FavorsRequestHandler.get_user_favor_helpings_all_past);
UsersRouter.get('/:user_id/get-favor-helpings-past', UserExists, FavorsRequestHandler.get_user_favor_helpings_past);
UsersRouter.get('/:user_id/get-favor-helpings-past/:favor_id', UserExists, FavorsRequestHandler.get_user_favor_helpings_past);


UsersRouter.get('/:you_id/settings', YouAuthorized, FavorsRequestHandler.get_settings);

UsersRouter.post('/:you_id/settings', YouAuthorized, FavorsRequestHandler.update_settings);

UsersRouter.post('/:you_id/assign-favor/:favor_id', YouAuthorized, YouHasStripeConnect, FavorExists, IsFavorActive, FavorsRequestHandler.assign_favor);
UsersRouter.post('/:you_id/unassign-favor/:favor_id', YouAuthorized, YouHasStripeConnect, FavorExists, FavorsRequestHandler.unassign_favor);

UsersRouter.post('/:you_id/mark-favor-as-started/:favor_id', YouAuthorized, FavorExists, IsFavorActive, IsFavorNotCanceled, FavorsRequestHandler.mark_favor_as_started);
UsersRouter.post('/:you_id/mark-favor-as-canceled/:favor_id', YouAuthorized, FavorExists, IsFavorOwner, IsFavorActive, FavorsRequestHandler.mark_favor_as_canceled);
UsersRouter.post('/:you_id/mark-favor-as-uncanceled/:favor_id', YouAuthorized, FavorExists, IsFavorOwner, IsFavorActive, FavorsRequestHandler.mark_favor_as_uncanceled);
UsersRouter.post('/:you_id/mark-favor-as-fulfilled/:favor_id', YouAuthorized, FavorExists, IsFavorActive, IsFavorNotCanceled, FavorsRequestHandler.mark_favor_as_fulfilled);

UsersRouter.post('/:you_id/create-favor-update/:favor_id', YouAuthorized, FavorExists, IsFavorActive, FavorsRequestHandler.create_favor_update);
// UsersRouter.post('/:you_id/add-fulfilled-picture/:favor_id', YouAuthorized, FavorExists, FavorsRequestHandler.add_fulfilled_picture); 