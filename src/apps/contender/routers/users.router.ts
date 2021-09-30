import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim, UserExists } from '../../_common/guards/user.guard';
import { ContenderService } from '../services/contender.service';


export const UsersRouter: Router = Router({ mergeParams: true });





UsersRouter.get('/:you_id/settings', YouAuthorized, ContenderService.get_settings);

UsersRouter.post('/:you_id/settings', YouAuthorized, ContenderService.update_settings);