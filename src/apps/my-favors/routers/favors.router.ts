import { Router } from 'express';
import {
  FavorExists,
  IsFavorOwner,
  IsFavorActive,
  IsFavorNotCanceled,
} from '../guards/favor.guard';
import {
  YouAuthorizedSlim,
  UserExists,
  YouHasStripeConnect,
  YouAuthorizedSlimWeak
} from '../../_common/guards/user.guard';
import { FavorsRequestHandler } from '../handlers/favors.handler';


export const FavorsRouter: Router = Router();



/** GET */

FavorsRouter.get('/:favor_id', FavorExists, FavorsRequestHandler.get_favor_by_id);



/** POST */

FavorsRouter.post('/', YouAuthorizedSlim, YouHasStripeConnect, FavorsRequestHandler.create_favor);
FavorsRouter.post('/search', YouAuthorizedSlim, FavorsRequestHandler.search_favors);
FavorsRouter.post('/:favor_id/message', YouAuthorizedSlim, FavorExists, IsFavorActive, IsFavorNotCanceled, FavorsRequestHandler.send_favor_message);

// FavorsRouter.post('/:favor_id/create-checkout-session', YouAuthorizedSlim, FavorExists, IsFavorOwner, FavorsRequestHandler.create_checkout_session);
FavorsRouter.post('/:favor_id/pay-helper/:user_id', YouAuthorizedSlim, UserExists, FavorExists, IsFavorOwner, FavorsRequestHandler.pay_helper);

FavorsRouter.post('/:favor_id/mark-helper-as-helped/:user_id', YouAuthorizedSlim, FavorExists, IsFavorOwner, IsFavorActive, IsFavorNotCanceled, FavorsRequestHandler.mark_helper_as_helped);
FavorsRouter.post('/:favor_id/mark-helper-as-unhelped/:user_id', YouAuthorizedSlim, FavorExists, IsFavorOwner, IsFavorActive, IsFavorNotCanceled, FavorsRequestHandler.mark_helper_as_unhelped);

FavorsRouter.post('/browse-recent', YouAuthorizedSlimWeak, FavorsRequestHandler.browse_recent_favors);
FavorsRouter.post('/browse-recent/:delivery_id', YouAuthorizedSlimWeak, FavorsRequestHandler.browse_featured_favors);
// FavorsRouter.post('/browse-featured', YouAuthorizedSlimWeak, FavorsRequestHandler.browse_featured_favors);
// FavorsRouter.post('/browse-featured/:delivery_id', YouAuthorizedSlimWeak, FavorsRequestHandler.browse_featured_favors);
FavorsRouter.post('/browse-map/swlat/:swlat/swlng/:swlng/nelat/:nelat/nelng/:nelng', YouAuthorizedSlimWeak, FavorsRequestHandler.browse_map_favors);



/** PUT */

FavorsRouter.put('/:favor_id', YouAuthorizedSlim, FavorExists, IsFavorOwner, IsFavorActive, FavorsRequestHandler.update_favor);



/** DELETE */

FavorsRouter.delete('/:favor_id', YouAuthorizedSlim, FavorExists, IsFavorOwner, IsFavorActive, FavorsRequestHandler.delete_favor);