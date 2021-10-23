import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim, UserExists } from '../../_common/guards/user.guard';
import { DeliveryExists } from '../guards/delivery.guard';
import { DeliveriesRequestHandler } from '../handlers/deliveries.handler';


export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-deliveries/all', UserExists, DeliveriesRequestHandler.get_user_deliveries_all);
UsersRouter.get('/:user_id/get-deliveries', UserExists, DeliveriesRequestHandler.get_user_deliveries);
UsersRouter.get('/:user_id/get-deliveries/:delivery_id', UserExists, DeliveriesRequestHandler.get_user_deliveries);

UsersRouter.get('/:user_id/get-deliverings/all', UserExists, DeliveriesRequestHandler.get_user_deliverings_all);
UsersRouter.get('/:user_id/get-deliverings', UserExists, DeliveriesRequestHandler.get_user_deliverings);
UsersRouter.get('/:user_id/get-deliverings/:delivery_id', UserExists, DeliveriesRequestHandler.get_user_deliverings);

UsersRouter.get('/:you_id/delivering', YouAuthorized, DeliveriesRequestHandler.get_user_delivering);
UsersRouter.get('/:you_id/settings', YouAuthorized, DeliveriesRequestHandler.get_settings);

UsersRouter.post('/:you_id/settings', YouAuthorized, DeliveriesRequestHandler.update_settings);

UsersRouter.post('/:you_id/assign-delivery/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.assign_delivery);
UsersRouter.post('/:you_id/unassign-delivery/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.unassign_delivery);
UsersRouter.post('/:you_id/mark-delivery-as-picked-up/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.mark_delivery_as_picked_up);
UsersRouter.post('/:you_id/mark-delivery-as-dropped-off/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.mark_delivery_as_dropped_off);
UsersRouter.post('/:you_id/mark-delivery-as-returned/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.mark_delivery_as_returned);
UsersRouter.post('/:you_id/mark-delivery-as-completed/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.mark_delivery_as_completed);
UsersRouter.post('/:you_id/create-tracking-update/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.create_tracking_update);
UsersRouter.post('/:you_id/add-delivered-picture/:delivery_id', YouAuthorized, DeliveryExists, DeliveriesRequestHandler.add_delivered_picture); 