import { Router } from 'express';
import { UserExists } from 'src/apps/_common/guards/user.guard';
import { MarkersRequestHandler } from '../handlers/markers.handler';



export const UsersRouter: Router = Router();

/** Public GET */

UsersRouter.get('/:user_id/get-markers/all', UserExists, MarkersRequestHandler.get_user_markers_all);
UsersRouter.get('/:user_id/get-markers', UserExists, MarkersRequestHandler.get_user_markers);
UsersRouter.get('/:user_id/get-markers/:marker_id', UserExists, MarkersRequestHandler.get_user_markers);