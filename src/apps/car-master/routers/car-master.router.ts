import { Router } from 'express';
import {
  YouAuthorized, YouAuthorizedSlim,
} from '../../_common/guards/user.guard';
import { MechanicCredentialRouteGuards } from '../guards/mechanic-credential.guard';
import { MechanicExpertiseRouteGuards } from '../guards/mechanic-expertise.guard';
import { MechanicFieldRouteGuards } from '../guards/mechanic-field.guard';
import { MechanicRatingRouteGuards } from '../guards/mechanic-rating.guard';
import { MechanicServiceRouteGuards } from '../guards/mechanic-service.guard';
import { MechanicExistsStrong, MechanicRouteGuards } from '../guards/mechanic.guard';
import { CarMasterRequestHandler } from '../handlers/car-master.handler';



export const CarMasterAppRouter: Router = Router();

const mechanic_auths = [
  YouAuthorizedSlim,
  MechanicExistsStrong
];

const field_owner_auths = [
  ...mechanic_auths,
  MechanicFieldRouteGuards.existsGuard,
  MechanicFieldRouteGuards.isOwnerGuard,
];
const credential_owner_auths = [
  ...mechanic_auths,
  MechanicCredentialRouteGuards.existsGuard,
  MechanicCredentialRouteGuards.isOwnerGuard,
];
const expertise_owner_auths = [
  ...mechanic_auths,
  MechanicExpertiseRouteGuards.existsGuard,
  MechanicExpertiseRouteGuards.isOwnerGuard,
];
const service_owner_auths = [
  ...mechanic_auths,
  MechanicServiceRouteGuards.existsGuard,
  MechanicServiceRouteGuards.isOwnerGuard,
];



/** Mechanics */

// GET

CarMasterAppRouter.get('/mechanics/:mechanic_id', CarMasterRequestHandler.get_mechanic_by_id);
CarMasterAppRouter.get('/mechanics/by-user-id/:user_id', CarMasterRequestHandler.get_mechanic_by_user_id);




// POST

CarMasterAppRouter.post('/mechanics/search', CarMasterRequestHandler.search_mechanics);

CarMasterAppRouter.post('/mechanics/:you_id/profile', YouAuthorized, CarMasterRequestHandler.create_mechanic_profile);

CarMasterAppRouter.post('/mechanics/:mechanic_id/field', ...mechanic_auths, CarMasterRequestHandler.create_mechanic_field);
CarMasterAppRouter.post('/mechanics/:mechanic_id/credential', ...mechanic_auths, CarMasterRequestHandler.create_mechanic_credential);
CarMasterAppRouter.post('/mechanics/:mechanic_id/expertise', ...mechanic_auths, CarMasterRequestHandler.create_mechanic_expertise);
CarMasterAppRouter.post('/mechanics/:mechanic_id/service', ...mechanic_auths, CarMasterRequestHandler.create_mechanic_service);
CarMasterAppRouter.post('/mechanics/:mechanic_id/rating', YouAuthorizedSlim, MechanicRouteGuards.existsGuard, MechanicRouteGuards.isNotOwnerGuard, CarMasterRequestHandler.create_mechanic_rating);
CarMasterAppRouter.post('/mechanics/:mechanic_id/rating/:rating_id/edit', YouAuthorizedSlim, MechanicRouteGuards.existsGuard, MechanicRouteGuards.isNotOwnerGuard, MechanicRatingRouteGuards.existsGuard, MechanicRatingRouteGuards.isOwnerGuard, CarMasterRequestHandler.create_mechanic_rating_edit);



// PUT

CarMasterAppRouter.put('/mechanics/:mechanic_id/profile', ...mechanic_auths, CarMasterRequestHandler.update_mechanic_profile);

CarMasterAppRouter.put('/mechanics/:mechanic_id/field/:field_id', ...field_owner_auths, CarMasterRequestHandler.update_mechanic_field);
CarMasterAppRouter.put('/mechanics/:mechanic_id/credential/:credential_id', ...credential_owner_auths, CarMasterRequestHandler.update_mechanic_credential);
CarMasterAppRouter.put('/mechanics/:mechanic_id/expertise/:expertise_id', ...expertise_owner_auths, CarMasterRequestHandler.update_mechanic_expertise);
CarMasterAppRouter.put('/mechanics/:mechanic_id/service/:service_id', ...service_owner_auths, CarMasterRequestHandler.update_mechanic_service);



// DELETE

CarMasterAppRouter.delete('/mechanics/:mechanic_id/field/:field_id', ...field_owner_auths, CarMasterRequestHandler.delete_mechanic_field);
CarMasterAppRouter.delete('/mechanics/:mechanic_id/credential/:credential_id', ...credential_owner_auths, CarMasterRequestHandler.delete_mechanic_credential);
CarMasterAppRouter.delete('/mechanics/:mechanic_id/expertise/:expertise_id', ...expertise_owner_auths, CarMasterRequestHandler.delete_mechanic_expertise);
CarMasterAppRouter.delete('/mechanics/:mechanic_id/service/:service_id', ...service_owner_auths, CarMasterRequestHandler.delete_mechanic_service);
// CarMasterAppRouter.delete('/mechanics/:mechanic_id/rating/:rating_id', ...mechanic_auths, MechanicRouteGuards.isNotOwnerGuard, MechanicRatingRouteGuards.isOwnerGuard, CarMasterRequestHandler.delete_mechanic_rating);