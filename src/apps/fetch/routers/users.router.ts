import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim, UserExists } from '../../_common/guards/user.guard';


export const UsersRouter: Router = Router();

/** Public GET */