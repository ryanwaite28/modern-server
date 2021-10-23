import { Router } from 'express';
import { YouAuthorized } from '../../_common/guards/user.guard';
import { CliqueExists, IsCliqueCreator, IsNotCliqueCreator } from '../guards/clique.guard';
import { CliqueInterestsRequestHandler } from '../handlers/clique-interests.handler';
import { CliqueMembersRequestHandler } from '../handlers/clique-members.handler';
import { CliquesRequestHandler } from '../handlers/cliques.handler';


export const CliquesRouter: Router = Router();

// GET Routes

CliquesRouter.get('/:clique_id', CliqueExists, CliquesRequestHandler.get_clique_by_id);
CliquesRouter.get('/:clique_id/interests/all', CliqueExists, CliqueInterestsRequestHandler.get_clique_interests_all);
CliquesRouter.get('/:clique_id/interests', CliqueExists, CliqueInterestsRequestHandler.get_clique_interests);
CliquesRouter.get('/:clique_id/interests/:interest_id', CliqueExists, CliqueInterestsRequestHandler.get_clique_interests);

// POST Routes

CliquesRouter.post('/creator/:you_id', YouAuthorized, CliquesRequestHandler.create_clique);
CliquesRouter.post('/:clique_id/interests/user/:you_id', YouAuthorized, CliqueExists, CliqueInterestsRequestHandler.show_interest);
CliquesRouter.post('/:clique_id/member-requests/creator/:you_id/user/:user_id', YouAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersRequestHandler.send_clique_member_request);

// PUT Routes

CliquesRouter.put('/:clique_id/creator/:you_id', YouAuthorized, CliqueExists, CliquesRequestHandler.update_clique);
CliquesRouter.put('/:clique_id/member-requests/:member_request_id/user/:you_id/accept', YouAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersRequestHandler.accept_clique_member_request);

// DELETE Routes

CliquesRouter.delete('/:clique_id/creator/:you_id', YouAuthorized, CliqueExists, CliquesRequestHandler.delete_clique);
CliquesRouter.delete('/:clique_id/interests/user/:you_id', YouAuthorized, CliqueExists, CliqueInterestsRequestHandler.remove_interest);
CliquesRouter.delete('/:clique_id/members/user/:you_id/leave', YouAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersRequestHandler.leave_clique);
CliquesRouter.delete('/:clique_id/members/creator/:you_id/user/:user_id', YouAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersRequestHandler.remove_clique_member);
CliquesRouter.delete('/:clique_id/member-requests/:member_request_id/creator/:you_id/cancel', YouAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersRequestHandler.cancel_clique_member_request);
CliquesRouter.delete('/:clique_id/member-requests/:member_request_id/user/:you_id/decline', YouAuthorized, CliqueExists, IsNotCliqueCreator, CliqueMembersRequestHandler.decline_clique_member_request);
