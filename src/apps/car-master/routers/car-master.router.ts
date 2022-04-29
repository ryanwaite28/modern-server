import { Router } from 'express';
import {
  YouAuthorized,
  YouAuthorizedSlim,
  YouAuthorizedSlimWeak
} from '../../_common/guards/user.guard';
import { CarMasterRequestHandler } from '../handlers/car-master.handler';



export const CarMasterAppRouter: Router = Router();



/** Mechanics */

// GET

CarMasterAppRouter.get('/mechanics/:mechanic_id', CarMasterRequestHandler.get_mechanic_by_id);