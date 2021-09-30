import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';
import { DeliveryExists, IsDeliveryOwner } from '../guards/delivery.guard';
import { DeliveriesService } from '../services/deliveries.service';


export const DeliveriesRouter: Router = Router();

/** GET */

DeliveriesRouter.get('/:delivery_id', DeliveryExists, DeliveriesService.get_delivery_by_id);
DeliveriesRouter.get('/find-available-from/city/:city/state/:state', YouAuthorizedSlim, DeliveriesService.find_available_delivery_by_from_city_and_state);
DeliveriesRouter.get('/find-available-to/city/:city/state/:state', YouAuthorizedSlim, DeliveriesService.find_available_delivery_by_to_city_and_state);



/** POST */

DeliveriesRouter.post('/', YouAuthorizedSlim, DeliveriesService.create_delivery);
DeliveriesRouter.post('/find-available', YouAuthorizedSlim, DeliveriesService.find_available_delivery);
DeliveriesRouter.post('/search', YouAuthorizedSlim, DeliveriesService.search_deliveries);
DeliveriesRouter.post('/:delivery_id/message', YouAuthorizedSlim, DeliveryExists, DeliveriesService.send_delivery_message);

DeliveriesRouter.post('/:delivery_id/create-checkout-session', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.create_checkout_session);
DeliveriesRouter.post('/:delivery_id/payment-success', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.payment_success);
DeliveriesRouter.post('/:delivery_id/payment-cancel', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.payment_cancel);


/** PUT */

// DeliveriesRouter.put('/:delivery_id', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.update_delivery);



/** DELETE */

DeliveriesRouter.delete('/:delivery_id', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesService.delete_delivery);