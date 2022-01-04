import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim, YouAuthorizedSlimWeak } from '../../_common/guards/user.guard';
import { DeliveryExists, IsDeliveryOwner } from '../guards/delivery.guard';
import { DeliveriesRequestHandler } from '../handlers/deliveries.handler';


export const DeliveriesRouter: Router = Router();

/** GET */

DeliveriesRouter.get('/:delivery_id', DeliveryExists, DeliveriesRequestHandler.get_delivery_by_id);
DeliveriesRouter.get('/find-available-from/city/:city/state/:state', YouAuthorizedSlim, DeliveriesRequestHandler.find_available_delivery_by_from_city_and_state);
DeliveriesRouter.get('/find-available-to/city/:city/state/:state', YouAuthorizedSlim, DeliveriesRequestHandler.find_available_delivery_by_to_city_and_state);



/** POST */

DeliveriesRouter.post('/', YouAuthorizedSlim, DeliveriesRequestHandler.create_delivery);
DeliveriesRouter.post('/find-available', YouAuthorizedSlim, DeliveriesRequestHandler.find_available_delivery);
DeliveriesRouter.post('/search', YouAuthorizedSlimWeak, DeliveriesRequestHandler.search_deliveries);
DeliveriesRouter.post('/browse-recent', YouAuthorizedSlimWeak, DeliveriesRequestHandler.browse_recent_deliveries);
DeliveriesRouter.post('/browse-recent/:delivery_id', YouAuthorizedSlimWeak, DeliveriesRequestHandler.browse_recent_deliveries);
// DeliveriesRouter.post('/browse-featured', YouAuthorizedSlimWeak, DeliveriesRequestHandler.browse_featured_deliveries);
// DeliveriesRouter.post('/browse-featured/:delivery_id', YouAuthorizedSlimWeak, DeliveriesRequestHandler.browse_featured_deliveries);
DeliveriesRouter.post('/browse-map/swlat/:swlat/swlng/:swlng/nelat/:nelat/nelng/:nelng', YouAuthorizedSlimWeak, DeliveriesRequestHandler.browse_map_deliveries);

DeliveriesRouter.post('/:delivery_id/message', YouAuthorizedSlim, DeliveryExists, DeliveriesRequestHandler.send_delivery_message);
DeliveriesRouter.post('/:delivery_id/create-payment-intent', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesRequestHandler.create_payment_intent);
DeliveriesRouter.post('/:delivery_id/payment-success', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesRequestHandler.payment_success);
DeliveriesRouter.post('/:delivery_id/payment-cancel', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesRequestHandler.payment_cancel);


/** PUT */

// DeliveriesRouter.put('/:delivery_id', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesRequestHandler.update_delivery);



/** DELETE */

DeliveriesRouter.delete('/:delivery_id', YouAuthorizedSlim, DeliveryExists, IsDeliveryOwner, DeliveriesRequestHandler.delete_delivery);