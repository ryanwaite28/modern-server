import { Router } from 'express';
import { UserExists } from '../../_common/guards/user.guard';
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