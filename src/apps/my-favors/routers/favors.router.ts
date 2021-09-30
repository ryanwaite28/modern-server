import { Router } from 'express';
import { FavorsService } from '../services/favors.service';
import {
  FavorExists,
  IsFavorOwner,
  IsFavorActive,
} from '../guards/favor.guard';
import {
  YouAuthorized,
  YouAuthorizedSlim,
  UserExists
} from '../../_common/guards/user.guard';


export const FavorsRouter: Router = Router();



/** GET */

FavorsRouter.get('/:favor_id', FavorExists, FavorsService.get_favor_by_id);



/** POST */

FavorsRouter.post('/', YouAuthorizedSlim, FavorsService.create_favor);
FavorsRouter.post('/search', YouAuthorizedSlim, FavorsService.search_favors);
FavorsRouter.post('/:favor_id/message', YouAuthorizedSlim, FavorExists, IsFavorActive, FavorsService.send_favor_message);

// FavorsRouter.post('/:favor_id/create-checkout-session', YouAuthorizedSlim, FavorExists, IsFavorOwner, FavorsService.create_checkout_session);
FavorsRouter.post('/:favor_id/pay-helper/:user_id', YouAuthorizedSlim, UserExists, FavorExists, IsFavorOwner, FavorsService.pay_helper);

FavorsRouter.post('/:favor_id/mark-helper-as-helped/:user_id', YouAuthorized, FavorExists, IsFavorOwner, IsFavorActive, FavorsService.mark_helper_as_helped);
FavorsRouter.post('/:favor_id/mark-helper-as-unhelped/:user_id', YouAuthorized, FavorExists, IsFavorOwner, IsFavorActive, FavorsService.mark_helper_as_unhelped);


/** PUT */

// FavorsRouter.put('/:favor_id', YouAuthorizedSlim, FavorExists, IsDeliveryOwner, FavorsService.update_favor);



/** DELETE */

FavorsRouter.delete('/:favor_id', YouAuthorizedSlim, FavorExists, IsFavorOwner, IsFavorActive, FavorsService.delete_favor);