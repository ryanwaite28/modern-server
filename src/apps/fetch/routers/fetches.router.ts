import { Router } from 'express';
import { YouAuthorized, YouAuthorizedSlim } from '../../_common/guards/user.guard';


export const FetchesRouter: Router = Router();