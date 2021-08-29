import { Router } from 'express';
import { CliqueExists, IsCliqueCreator, IsNotCliqueCreator } from '../guards/clique.guard';
import { CliqueInterestsService } from '../services/clique-interests.service';
import { CliquesService } from '../services/cliques.service';
import { UserAuthorized } from '../../_common/guards/user.guard';
import { CliqueMembersService } from '../services/clique-members.service';


export const CliquesRouter: Router = Router();

// GET Routes

CliquesRouter.get('/:clique_id', CliqueExists, CliquesService.get_clique);
CliquesRouter.get('/:clique_id/interests/all', CliqueExists, CliqueInterestsService.get_clique_interests_all);
CliquesRouter.get('/:clique_id/interests', CliqueExists, CliqueInterestsService.get_clique_interests);
CliquesRouter.get('/:clique_id/interests/:interest_id', CliqueExists, CliqueInterestsService.get_clique_interests);

// POST Routes

CliquesRouter.post('/creator/:you_id', UserAuthorized, CliquesService.create_clique);
CliquesRouter.post('/:clique_id/interests/user/:you_id', UserAuthorized, CliqueExists, CliqueInterestsService.show_interest);
CliquesRouter.post('/:clique_id/member-requests/creator/:you_id/user/:user_id', UserAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.send_clique_member_request);

// PUT Routes

CliquesRouter.put('/:clique_id/creator/:you_id', UserAuthorized, CliqueExists, CliquesService.update_clique);
CliquesRouter.put('/:clique_id/member-requests/:member_request_id/user/:you_id/accept', UserAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersService.accept_clique_member_request);

// DELETE Routes

CliquesRouter.delete('/:clique_id/creator/:you_id', UserAuthorized, CliqueExists, CliquesService.delete_clique);
CliquesRouter.delete('/:clique_id/interests/user/:you_id', UserAuthorized, CliqueExists, CliqueInterestsService.remove_interest);
CliquesRouter.delete('/:clique_id/members/user/:you_id/leave', UserAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersService.leave_clique);
CliquesRouter.delete('/:clique_id/members/creator/:you_id/user/:user_id', UserAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.remove_clique_member);
CliquesRouter.delete('/:clique_id/member-requests/:member_request_id/creator/:you_id/cancel', UserAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.cancel_clique_member_request);
CliquesRouter.delete('/:clique_id/member-requests/:member_request_id/user/:you_id/decline', UserAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersService.decline_clique_member_request);
