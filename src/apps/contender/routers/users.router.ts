import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim, UserExists } from '../../_common/guards/user.guard';
import { ContenderRequestHandler } from '../handlers/contender.handler';


export const UsersRouter: Router = Router({ mergeParams: true });





UsersRouter.get('/:you_id/settings', YouAuthorized, ContenderRequestHandler.get_settings);

// UsersRouter.post('/:you_id/settings', YouAuthorized, ContenderRequestHandler.update_settings);