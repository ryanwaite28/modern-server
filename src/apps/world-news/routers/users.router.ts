import { Router } from 'express';
import { NewsPostsService } from '../services/newsposts.service';

export const UsersRouter: Router = Router();

UsersRouter.get('/:user_id/get-newsposts/all', NewsPostsService.get_user_newsposts_all);
UsersRouter.get('/:user_id/get-newsposts', NewsPostsService.get_user_newsposts);
UsersRouter.get('/:user_id/get-newsposts/:newspost_id', NewsPostsService.get_user_newsposts);