import { Router } from 'express';
import { UserAuthorized, UserAuthorizedSlim } from '../../_common/guards/user.guard';
import { DeliveryExists, IsDeliveryOwner } from '../guards/delivery.guard';
import { DeliveriesService } from '../services/deliveries.service';


export const DeliveriesRouter: Router = Router();

/** GET */

DeliveriesRouter.get('/:delivery_id', DeliveryExists, DeliveriesService.get_delivery_by_id);
DeliveriesRouter.get('/find-available-from/city/:city/state/:state', UserAuthorizedSlim, DeliveriesService.find_available_delivery_by_from_city_and_state);
DeliveriesRouter.get('/find-available-to/city/:city/state/:state', UserAuthorizedSlim, DeliveriesService.find_available_delivery_by_to_city_and_state);



/** POST */

DeliveriesRouter.post('/', UserAuthorizedSlim, DeliveriesService.create_delivery);
DeliveriesRouter.post('/find-available', UserAuthorizedSlim, DeliveriesService.find_available_delivery);



/** PUT */

DeliveriesRouter.put('/:delivery_id', UserAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.update_delivery);



/** DELETE */

DeliveriesRouter.delete('/:delivery_id', UserAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.delete_delivery);