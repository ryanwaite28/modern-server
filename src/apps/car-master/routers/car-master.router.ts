import { Router } from 'express';
import {
  UserExists,
  UserIdsAreDifferent,
  YouAuthorized, YouAuthorizedSlim, YouAuthorizedSlimWeak,
} from '../../_common/guards/user.guard';
import { MechanicCredentialRouteGuards } from '../guards/mechanic-credential.guard';
import { MechanicExpertiseRouteGuards } from '../guards/mechanic-expertise.guard';
import { MechanicFieldRouteGuards } from '../guards/mechanic-field.guard';
import { MechanicRatingRouteGuards } from '../guards/mechanic-rating.guard';
import { MechanicServiceRouteGuards } from '../guards/mechanic-service.guard';
import { MechanicExistsStrong, MechanicRouteGuards } from '../guards/mechanic.guard';
import { ServiceRequestRouteGuards } from '../guards/service-request.guard';
import { CarMasterRequestHandler } from '../handlers/car-master.handler';
import { MessagesRequestHandler } from '../handlers/messages.handler';
import { MessagingsRequestHandler } from '../handlers/messagings.handler';
import { NotificationsRequestHandler } from '../handlers/notifications.handler';



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

CarMasterAppRouter.get('/mechanics/:mechanic_id/service-requests/all', MechanicRouteGuards.existsGuard, CarMasterRequestHandler.get_mechanic_service_requests_all);
CarMasterAppRouter.get('/mechanics/:mechanic_id/service-requests', MechanicRouteGuards.existsGuard, CarMasterRequestHandler.get_mechanic_service_requests);
CarMasterAppRouter.get('/mechanics/:mechanic_id/service-requests/:service_request_id', MechanicRouteGuards.existsGuard, CarMasterRequestHandler.get_mechanic_service_requests);




// POST

CarMasterAppRouter.post('/mechanics/search-mechanics', YouAuthorizedSlimWeak, CarMasterRequestHandler.search_mechanics);
CarMasterAppRouter.post('/mechanics/search-service-requests', YouAuthorizedSlimWeak, CarMasterRequestHandler.search_service_requests);

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












/** Users */

// GET

CarMasterAppRouter.get('/users/:user_id/service-requests/all', UserExists, CarMasterRequestHandler.get_user_service_requests_all);
CarMasterAppRouter.get('/users/:user_id/service-requests', UserExists, CarMasterRequestHandler.get_user_service_requests);
CarMasterAppRouter.get('/users/:user_id/service-requests/:service_request_id', UserExists, CarMasterRequestHandler.get_user_service_requests);

CarMasterAppRouter.get('/users/:you_id/messagings/all', YouAuthorized, MessagingsRequestHandler.get_user_messagings_all);
CarMasterAppRouter.get('/users/:you_id/messagings', YouAuthorized, MessagingsRequestHandler.get_user_messagings);
CarMasterAppRouter.get('/users/:you_id/messagings/:messagings_timestamp', YouAuthorized, MessagingsRequestHandler.get_user_messagings);

CarMasterAppRouter.get('/users/:you_id/messages/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.get_user_messages);
CarMasterAppRouter.get('/users/:you_id/messages/:user_id/:min_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.get_user_messages);


CarMasterAppRouter.get('/users/:you_id/notifications/all', YouAuthorized, NotificationsRequestHandler.get_user_notifications_all);
CarMasterAppRouter.get('/users/:you_id/notifications', YouAuthorized, NotificationsRequestHandler.get_user_notifications);
CarMasterAppRouter.get('/users/:you_id/notifications/:notification_id', YouAuthorized, NotificationsRequestHandler.get_user_notifications);


// POST

CarMasterAppRouter.post('/users/:you_id/send-message/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.send_user_message);
CarMasterAppRouter.post('/users/:you_id/notifications/update-last-opened', YouAuthorized, NotificationsRequestHandler.update_user_last_opened);

CarMasterAppRouter.post('/users/:you_id/service-request', YouAuthorized, CarMasterRequestHandler.create_service_request);


// PUT

CarMasterAppRouter.put('/users/:you_id/message/:message_id/mark-as-read', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.mark_message_as_read);

CarMasterAppRouter.put('/users/:you_id/service-request/:service_request_id', YouAuthorized, ServiceRequestRouteGuards.existsGuard, ServiceRequestRouteGuards.isOwnerGuard, CarMasterRequestHandler.update_service_request);


// DELETE

CarMasterAppRouter.delete('/users/:you_id/service-request/:service_request_id', YouAuthorized, ServiceRequestRouteGuards.existsGuard, ServiceRequestRouteGuards.isOwnerGuard, CarMasterRequestHandler.delete_service_request);