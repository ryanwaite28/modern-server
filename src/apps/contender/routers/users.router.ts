import { Router } from 'express';
import { UserAuthorized, UserAuthorizedSlim, UserExists } from '../../_common/guards/user.guard';
import { ContenderService } from '../services/contender.service';


export const UsersRouter: Router = Router({ mergeParams: true });





UsersRouter.get('/:you_id/settings', UserAuthorized, ContenderService.get_settings);

UsersRouter.post('/:you_id/settings', UserAuthorized, ContenderService.update_settings);