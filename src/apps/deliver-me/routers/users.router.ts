import { Router } from 'express';
import { UserAuthorized, UserAuthorizedSlim, UserExists } from '../../_common/guards/user.guard';
import { DeliveryExists } from '../guards/delivery.guard';
import { DeliveriesService } from '../services/deliveries.service';


export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-deliveries/all', UserExists, DeliveriesService.get_user_deliveries_all);
UsersRouter.get('/:user_id/get-deliveries', UserExists, DeliveriesService.get_user_deliveries);
UsersRouter.get('/:user_id/get-deliveries/:delivery_id', UserExists, DeliveriesService.get_user_deliveries);

UsersRouter.get('/:user_id/get-deliverings/all', UserExists, DeliveriesService.get_user_deliverings_all);
UsersRouter.get('/:user_id/get-deliverings', UserExists, DeliveriesService.get_user_deliverings);
UsersRouter.get('/:user_id/get-deliverings/:delivery_id', UserExists, DeliveriesService.get_user_deliverings);

UsersRouter.get('/:you_id/delivering', UserAuthorized, DeliveriesService.get_user_delivering);
UsersRouter.get('/:you_id/settings', UserAuthorized, DeliveriesService.get_settings);

UsersRouter.post('/:you_id/settings', UserAuthorized, DeliveriesService.update_settings);

UsersRouter.post('/:you_id/assign-delivery/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.assign_delivery);
UsersRouter.post('/:you_id/unassign-delivery/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.unassign_delivery);
UsersRouter.post('/:you_id/mark-delivery-as-picked-up/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.mark_delivery_as_picked_up);
UsersRouter.post('/:you_id/mark-delivery-as-dropped-off/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.mark_delivery_as_dropped_off);
UsersRouter.post('/:you_id/mark-delivery-as-completed/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.mark_delivery_as_completed);
UsersRouter.post('/:you_id/create-tracking-update/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.create_tracking_update);
UsersRouter.post('/:you_id/add-delivered-picture/:delivery_id', UserAuthorized, DeliveryExists, DeliveriesService.add_delivered_picture);