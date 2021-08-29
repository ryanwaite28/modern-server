import { Router } from 'express';
import { FavorsService } from '../services/favors.service';


export const UsersRouter: Router = Router();

/** Public GET */

// UsersRouter.get('/:user_id/get-markers/all', FavorsService.get_user_markers_all);
// UsersRouter.get('/:user_id/get-markers', FavorsService.get_user_markers);
// UsersRouter.get('/:user_id/get-markers/:marker_id', FavorsService.get_user_markers);