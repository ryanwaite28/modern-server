import { Router } from 'express';
import { YouAuthorized } from '../../_common/guards/user.guard';
import { MarkersRequestHandler } from '../handlers/markers.handler';
import { MODERN_APP_NAMES } from '../../_common/enums/common.enum';
import { populate_travellrs_notification_obj } from '../../travellrs/travellrs.chamber';
import { createModelRouteGuards } from '../../_common/helpers/create-model-guards.helper';
import { get_marker_by_id } from '../repos/markers.repo';
import { TRAVELLRS_EVENT_TYPES } from '../enums/travellrs.enum';
import { MarkerCommentReactions, MarkerCommentReplies, MarkerCommentReplyReactions, MarkerComments, MarkerReactions } from '../models/marker.model';
import { MountGenericModelSocialRouterServiceHandler } from '../../_common/helpers/mount-model-social-router-service-handler.helper';



export const MarkersRouter: Router = Router();

const MarkerRouteGuards = createModelRouteGuards({
  get_model_fn: get_marker_by_id,
  model_name: 'marker',
  model_owner_field: 'owner_id',
  request_param_id_name: 'marker_id',
});

// GET Routes

MarkersRouter.get('/random', MarkerRouteGuards.existsGuard, MarkersRequestHandler.get_random_markers);
MarkersRouter.get('/:marker_id', MarkerRouteGuards.existsGuard, MarkersRequestHandler.get_marker_by_id);



// MARKER Routes

MarkersRouter.post('/owner/:you_id', YouAuthorized, MarkersRequestHandler.create_marker);



// PUT Routes

MarkersRouter.put('/:marker_id/owner/:you_id', YouAuthorized, MarkerRouteGuards.existsGuard, MarkerRouteGuards.isOwnerGuard, MarkersRequestHandler.update_marker);



// DELETE Routes

MarkersRouter.delete('/:marker_id/owner/:you_id', YouAuthorized, MarkerRouteGuards.existsGuard, MarkerRouteGuards.isOwnerGuard, MarkersRequestHandler.delete_marker);





MountGenericModelSocialRouterServiceHandler({
  base_model_name: `marker`,
  base_model_route_guards: MarkerRouteGuards,
  mountingRouter: MarkersRouter,
  micro_app: MODERN_APP_NAMES.TRAVELLRS,
  eventsEnumObj: TRAVELLRS_EVENT_TYPES,
  populate_notification_fn: populate_travellrs_notification_obj,
  models: {
    base_reactions_model: MarkerReactions,
    base_comments_model: MarkerComments,
    base_comment_reactions_model: MarkerCommentReactions,
    base_comment_replies_model: MarkerCommentReplies,
    base_comment_reply_reactions_model: MarkerCommentReplyReactions,
  }
});
