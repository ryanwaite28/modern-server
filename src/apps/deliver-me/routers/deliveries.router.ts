import { Router } from 'express';
import { UserAuthorized } from '../../_common/guards/user.guard';
import { DeliveryExists, IsDeliveryOwner } from '../guards/delivery.guard';
import { DeliveriesService } from '../services/deliveries.service';


export const DeliveriesRouter: Router = Router();

/** GET */

DeliveriesRouter.get('/:delivery_id', DeliveryExists, DeliveriesService.get_delivery_by_id);



/** POST */

DeliveriesRouter.post('/', UserAuthorized, DeliveriesService.create_delivery);



/** PUT */

DeliveriesRouter.put('/:delivery_id', UserAuthorized, DeliveryExists, IsDeliveryOwner, DeliveriesService.update_delivery);



/** DELETE */

DeliveriesRouter.delete('/:delivery_id', UserAuthorized, DeliveryExists, IsDeliveryOwner, DeliveriesService.delete_delivery);