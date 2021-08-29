import { Router } from 'express';
import { MarkersService } from '../services/markers.service';


export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-markers/all', MarkersService.get_user_markers_all);
UsersRouter.get('/:user_id/get-markers', MarkersService.get_user_markers);
UsersRouter.get('/:user_id/get-markers/:marker_id', MarkersService.get_user_markers);