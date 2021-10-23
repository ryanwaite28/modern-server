import { Router } from 'express';
import { NewsPostsRequestHandler } from '../handlers/newsposts.handler';

export const UsersRouter: Router = Router();

UsersRouter.get('/:user_id/get-newsposts/all', NewsPostsRequestHandler.get_user_newsposts_all);
UsersRouter.get('/:user_id/get-newsposts', NewsPostsRequestHandler.get_user_newsposts);
UsersRouter.get('/:user_id/get-newsposts/:newspost_id', NewsPostsRequestHandler.get_user_newsposts);