import { Router } from 'express';
import {
  YouAuthorized,
} from '../../_common/guards/user.guard';
import { CarMasterRequestHandler } from '../handlers/car-master.handler';



export const CarMasterAppRouter: Router = Router();



/** Mechanics */

// GET

CarMasterAppRouter.get('/mechanics/:mechanic_id', CarMasterRequestHandler.get_mechanic_by_id);
CarMasterAppRouter.get('/mechanics/by-user-id/:user_id', CarMasterRequestHandler.get_mechanic_by_user_id);




// POST

CarMasterAppRouter.get('/mechanics/:you_id/create-profile', YouAuthorized, CarMasterRequestHandler.create_mechanic_profile);