import { Router } from 'express';

// RequestHandlers

// guards
import { ResourceExists } from '../guards/resource.guard';
import { CliqueExists, IsCliqueCreator, IsNotCliqueCreator } from '../guards/clique.guard';
import { YouAuthorized, UserIdsAreDifferent } from '../../_common/guards/user.guard';
import { UsersRequestHandler } from '../../_common/handlers/users.handler';
import { CliqueInterestsRequestHandler } from '../handlers/clique-interests.handler';
import { CliqueMembersRequestHandler } from '../handlers/clique-members.handler';
import { CliquesRequestHandler } from '../handlers/cliques.handler';
import { PostsRequestHandler } from '../handlers/posts.handler';
import { ResourceInterestsRequestHandler } from '../handlers/resource-interests.handler';
import { ResourcesRequestHandler } from '../handlers/resources.handler';

// Router
export const UsersRouter: Router = Router();

// GET Routes
UsersRouter.get('/:you_id/member-requests/all', YouAuthorized, CliqueMembersRequestHandler.get_clique_member_requests_all);
UsersRouter.get('/:you_id/member-requests', YouAuthorized, CliqueMembersRequestHandler.get_clique_member_requests);
UsersRouter.get('/:you_id/member-requests/:member_request_id', YouAuthorized, CliqueMembersRequestHandler.get_clique_member_requests);

UsersRouter.get('/:you_id/unseen-counts', YouAuthorized, UsersRequestHandler.get_unseen_counts);

// UsersRouter.get('/:you_id/feed', YouAuthorized, UsersRequestHandler.get_user_feed);
// UsersRouter.get('/:you_id/feed/:min_id', YouAuthorized, UsersRequestHandler.get_user_feed);
// UsersRouter.get('/:you_id/random', YouAuthorized, UsersRequestHandler.get_random_models);
// UsersRouter.get('/:you_id/random/:min_id', YouAuthorized, UsersRequestHandler.get_random_models);
// UsersRouter.get('/:you_id/search', YouAuthorized, UsersRequestHandler.get_search_results);

UsersRouter.get('/:you_id/resources/:resource_id/interests', YouAuthorized, ResourceInterestsRequestHandler.check_interest);
UsersRouter.get('/:you_id/resources/all', YouAuthorized, ResourcesRequestHandler.get_user_resources_all);
UsersRouter.get('/:you_id/resources', YouAuthorized, ResourcesRequestHandler.get_user_resources);
UsersRouter.get('/:you_id/resources/:resource_id', YouAuthorized, ResourcesRequestHandler.get_user_resources);

UsersRouter.get('/:you_id/cliques/:clique_id/interests', YouAuthorized, CliqueInterestsRequestHandler.check_interest);
UsersRouter.get('/:you_id/cliques/:clique_id/membership', YouAuthorized, CliqueInterestsRequestHandler.check_membership);
UsersRouter.get('/:you_id/cliques/all', YouAuthorized, CliquesRequestHandler.get_user_cliques_all);
UsersRouter.get('/:you_id/cliques', YouAuthorized, CliquesRequestHandler.get_user_cliques);
UsersRouter.get('/:you_id/cliques/:clique_id', YouAuthorized, CliquesRequestHandler.get_user_cliques);

UsersRouter.get('/:you_id/cliques/:clique_id/members/all', YouAuthorized, CliqueExists, CliqueMembersRequestHandler.get_clique_members_all);
UsersRouter.get('/:you_id/cliques/:clique_id/members', YouAuthorized, CliqueExists, CliqueMembersRequestHandler.get_clique_members);
UsersRouter.get('/:you_id/cliques/:clique_id/members/:member_id', YouAuthorized, CliqueExists, CliqueMembersRequestHandler.get_clique_members);
UsersRouter.get('/:you_id/cliques/:clique_id/search-users', YouAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersRequestHandler.search_members);

/** Public GET */

UsersRouter.get('/id/:id', UsersRequestHandler.get_user_by_id);
UsersRouter.get('/phone/:phone', UsersRequestHandler.get_user_by_phone);

UsersRouter.get('/:user_id/get-posts/all', PostsRequestHandler.get_user_posts_all);
UsersRouter.get('/:user_id/get-posts', PostsRequestHandler.get_user_posts);
UsersRouter.get('/:user_id/get-posts/:post_id', PostsRequestHandler.get_user_posts);

UsersRouter.get('/:user_id/get-resources/all', ResourcesRequestHandler.get_user_resources_all);
UsersRouter.get('/:user_id/get-resources', ResourcesRequestHandler.get_user_resources);
UsersRouter.get('/:user_id/get-resources/:resource_id', ResourcesRequestHandler.get_user_resources);

UsersRouter.get('/:user_id/get-resource-interests/all', ResourceInterestsRequestHandler.get_user_resource_interests_all);
UsersRouter.get('/:user_id/get-resource-interests', ResourceInterestsRequestHandler.get_user_resource_interests);
UsersRouter.get('/:user_id/get-resource-interests/:interest_id', ResourceInterestsRequestHandler.get_user_resource_interests);

UsersRouter.get('/:user_id/get-cliques/all', CliquesRequestHandler.get_user_cliques_all);
UsersRouter.get('/:user_id/get-cliques', CliquesRequestHandler.get_user_cliques);
UsersRouter.get('/:user_id/get-cliques/:clique_id', CliquesRequestHandler.get_user_cliques);

UsersRouter.get('/:user_id/get-clique-interests/all', CliqueInterestsRequestHandler.get_user_clique_interests_all);
UsersRouter.get('/:user_id/get-clique-interests', CliqueInterestsRequestHandler.get_user_clique_interests);
UsersRouter.get('/:user_id/get-clique-interests/:interest_id', CliqueInterestsRequestHandler.get_user_clique_interests);

UsersRouter.get('/:user_id/get-clique-memberships/all', CliqueMembersRequestHandler.get_user_clique_members_all);
UsersRouter.get('/:user_id/get-clique-memberships', CliqueMembersRequestHandler.get_user_clique_members);
UsersRouter.get('/:user_id/get-clique-memberships/:member_id', CliqueMembersRequestHandler.get_user_clique_members);

/** END Public GET */

// POST Routes

// PUT Routes

// DELETE Routes

// UsersRouter.delete('/:you_id', YouAuthorized, UsersRequestHandler.delete_user_);


