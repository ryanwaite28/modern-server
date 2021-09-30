import { Router } from 'express';

// services
import { UsersService } from '../../_common/services/users.service';
import { PostsService } from '../services/posts.service';
import { ResourcesService } from '../services/resources.service';
import { ResourceInterestsService } from '../services/resource-interests.service';
import { CliquesService } from '../services/cliques.service';
import { CliqueInterestsService } from '../services/clique-interests.service';
import { CliqueMembersService } from '../services/clique-members.service';

// guards
import { ResourceExists } from '../guards/resource.guard';
import { CliqueExists, IsCliqueCreator, IsNotCliqueCreator } from '../guards/clique.guard';
import { YouAuthorized, UserIdsAreDifferent } from '../../_common/guards/user.guard';

// Router
export const UsersRouter: Router = Router();

// GET Routes
UsersRouter.get('/:you_id/member-requests/all', YouAuthorized, CliqueMembersService.get_clique_member_requests_all);
UsersRouter.get('/:you_id/member-requests', YouAuthorized, CliqueMembersService.get_clique_member_requests);
UsersRouter.get('/:you_id/member-requests/:member_request_id', YouAuthorized, CliqueMembersService.get_clique_member_requests);

UsersRouter.get('/:you_id/unseen-counts', YouAuthorized, UsersService.get_unseen_counts);

// UsersRouter.get('/:you_id/feed', YouAuthorized, UsersService.get_user_feed);
// UsersRouter.get('/:you_id/feed/:min_id', YouAuthorized, UsersService.get_user_feed);
// UsersRouter.get('/:you_id/random', YouAuthorized, UsersService.get_random_models);
// UsersRouter.get('/:you_id/random/:min_id', YouAuthorized, UsersService.get_random_models);
// UsersRouter.get('/:you_id/search', YouAuthorized, UsersService.get_search_results);

UsersRouter.get('/:you_id/resources/:resource_id/interests', YouAuthorized, ResourceInterestsService.check_interest);
UsersRouter.get('/:you_id/resources/all', YouAuthorized, ResourcesService.get_user_resources_all);
UsersRouter.get('/:you_id/resources', YouAuthorized, ResourcesService.get_user_resources);
UsersRouter.get('/:you_id/resources/:resource_id', YouAuthorized, ResourcesService.get_user_resources);

UsersRouter.get('/:you_id/cliques/:clique_id/interests', YouAuthorized, CliqueInterestsService.check_interest);
UsersRouter.get('/:you_id/cliques/:clique_id/membership', YouAuthorized, CliqueInterestsService.check_membership);
UsersRouter.get('/:you_id/cliques/all', YouAuthorized, CliquesService.get_user_cliques_all);
UsersRouter.get('/:you_id/cliques', YouAuthorized, CliquesService.get_user_cliques);
UsersRouter.get('/:you_id/cliques/:clique_id', YouAuthorized, CliquesService.get_user_cliques);

UsersRouter.get('/:you_id/cliques/:clique_id/members/all', YouAuthorized, CliqueExists, CliqueMembersService.get_clique_members_all);
UsersRouter.get('/:you_id/cliques/:clique_id/members', YouAuthorized, CliqueExists, CliqueMembersService.get_clique_members);
UsersRouter.get('/:you_id/cliques/:clique_id/members/:member_id', YouAuthorized, CliqueExists, CliqueMembersService.get_clique_members);
UsersRouter.get('/:you_id/cliques/:clique_id/search-users', YouAuthorized, CliqueExists, IsCliqueCreator, CliqueMembersService.search_members);

/** Public GET */

UsersRouter.get('/id/:id', UsersService.get_user_by_id);
UsersRouter.get('/phone/:phone', UsersService.get_user_by_phone);

UsersRouter.get('/:user_id/get-posts/all', PostsService.get_user_posts_all);
UsersRouter.get('/:user_id/get-posts', PostsService.get_user_posts);
UsersRouter.get('/:user_id/get-posts/:post_id', PostsService.get_user_posts);

// UsersRouter.get('/:user_id/get-recipes/all', RecipesService.get_user_recipes_all);
// UsersRouter.get('/:user_id/get-recipes', RecipesService.get_user_recipes);
// UsersRouter.get('/:user_id/get-recipes/:recipe_id', RecipesService.get_user_recipes);

UsersRouter.get('/:user_id/get-resources/all', ResourcesService.get_user_resources_all);
UsersRouter.get('/:user_id/get-resources', ResourcesService.get_user_resources);
UsersRouter.get('/:user_id/get-resources/:resource_id', ResourcesService.get_user_resources);

UsersRouter.get('/:user_id/get-resource-interests/all', ResourceInterestsService.get_user_resource_interests_all);
UsersRouter.get('/:user_id/get-resource-interests', ResourceInterestsService.get_user_resource_interests);
UsersRouter.get('/:user_id/get-resource-interests/:interest_id', ResourceInterestsService.get_user_resource_interests);

UsersRouter.get('/:user_id/get-cliques/all', CliquesService.get_user_cliques_all);
UsersRouter.get('/:user_id/get-cliques', CliquesService.get_user_cliques);
UsersRouter.get('/:user_id/get-cliques/:clique_id', CliquesService.get_user_cliques);

UsersRouter.get('/:user_id/get-clique-interests/all', CliqueInterestsService.get_user_clique_interests_all);
UsersRouter.get('/:user_id/get-clique-interests', CliqueInterestsService.get_user_clique_interests);
UsersRouter.get('/:user_id/get-clique-interests/:interest_id', CliqueInterestsService.get_user_clique_interests);

UsersRouter.get('/:user_id/get-clique-memberships/all', CliqueMembersService.get_user_clique_members_all);
UsersRouter.get('/:user_id/get-clique-memberships', CliqueMembersService.get_user_clique_members);
UsersRouter.get('/:user_id/get-clique-memberships/:member_id', CliqueMembersService.get_user_clique_members);

/** END Public GET */

// POST Routes

// PUT Routes

// DELETE Routes

// UsersRouter.delete('/:you_id', YouAuthorized, UsersService.delete_user_);


