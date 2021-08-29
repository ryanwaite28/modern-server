import { Router } from 'express';
import { MarkersService } from '../services/markers.service';
import {
  MarkerExists,
  IsMarkerOwner
} from '../guards/marker.guard';
import {
  UserAuthorized,
  UserExists
} from '../../_common/guards/user.guard';
import { CommentsRouter } from './marker-comments.router';


export const MarkersRouter: Router = Router();

// GET Routes

MarkersRouter.get('/random', MarkerExists, MarkersService.get_random_markers);

MarkersRouter.get('/:marker_id', MarkerExists, MarkersService.get_marker_by_id);
MarkersRouter.get('/:marker_id/user-reactions/count', MarkerExists, MarkersService.get_marker_reactions_counts);
MarkersRouter.get('/:marker_id/user-reactions/all', MarkerExists, MarkersService.get_marker_reactions_all);
MarkersRouter.get('/:marker_id/user-reactions', MarkerExists, MarkersService.get_marker_reactions);
MarkersRouter.get('/:marker_id/user-reactions/:marker_reaction_id', MarkerExists, MarkersService.get_marker_reactions);
MarkersRouter.get('/:marker_id/user-reaction/:user_id', UserExists, MarkerExists, MarkersService.get_user_reaction);

// POST Routes

MarkersRouter.post('/owner/:you_id', UserAuthorized, MarkersService.create_marker);

// PUT Routes

MarkersRouter.put('/:marker_id/owner/:you_id', UserAuthorized, MarkerExists, IsMarkerOwner, MarkersService.update_marker);
MarkersRouter.put('/:marker_id/user-reaction/user/:you_id', UserAuthorized, MarkerExists, MarkersService.toggle_user_reaction);

// DELETE Routes

MarkersRouter.delete('/:marker_id/owner/:you_id', UserAuthorized, MarkerExists, IsMarkerOwner, MarkersService.delete_marker);

// Sub-Routes

MarkersRouter.use(`/:marker_id/comments`, CommentsRouter);