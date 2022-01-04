import { Router } from 'express';
import { ApiIsDeliveryOwner } from '../guards/api.guard';
import { DeliveryExists, IsDeliveryOwner } from '../guards/delivery.guard';
import { DeliveriesRequestHandler } from '../handlers/deliveries.handler';
import { DelivermeApiRequestHandler } from '../handlers/deliverme-api.handler';


export const DelivermeApiRouter: Router = Router();

/** GET */

DelivermeApiRouter.get('/deliveries/:delivery_id', DeliveryExists, ApiIsDeliveryOwner, DeliveriesRequestHandler.get_delivery_by_id);

DelivermeApiRouter.get('/get-deliveries/all', DelivermeApiRequestHandler.get_user_deliveries_all);
DelivermeApiRouter.get('/get-deliveries', DelivermeApiRequestHandler.get_user_deliveries);
DelivermeApiRouter.get('/get-deliveries/:delivery_id', DelivermeApiRequestHandler.get_user_deliveries);

DelivermeApiRouter.get('/get-deliverings/all', DelivermeApiRequestHandler.get_user_deliverings_all);
DelivermeApiRouter.get('/get-deliverings', DelivermeApiRequestHandler.get_user_deliverings);
DelivermeApiRouter.get('/get-deliverings/:delivery_id', DelivermeApiRequestHandler.get_user_deliverings);


DelivermeApiRouter.post('/deliveries/create-delivery', DelivermeApiRequestHandler.create_delivery);
DelivermeApiRouter.post('/deliveries/:delivery_id/message', DeliveryExists, DelivermeApiRequestHandler.send_delivery_message);
DelivermeApiRouter.post('/deliveries/:delivery_id/create-payment-intent', DeliveryExists, ApiIsDeliveryOwner, DelivermeApiRequestHandler.create_payment_intent);
DelivermeApiRouter.post('/deliveries/:delivery_id/payment-success', DeliveryExists, ApiIsDeliveryOwner, DelivermeApiRequestHandler.payment_success);
DelivermeApiRouter.post('/deliveries/:delivery_id/payment-cancel', DeliveryExists, ApiIsDeliveryOwner, DelivermeApiRequestHandler.payment_cancel);
DelivermeApiRouter.post('/deliveries/mark-delivery-as-completed/:delivery_id', DeliveryExists, ApiIsDeliveryOwner, DelivermeApiRequestHandler.mark_delivery_as_completed);


DelivermeApiRouter.delete('/deliveries/:delivery_id', DeliveryExists, ApiIsDeliveryOwner, DelivermeApiRequestHandler.delete_delivery);